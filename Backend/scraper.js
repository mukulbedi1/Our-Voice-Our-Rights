import 'dotenv/config';
import axios from 'axios';
import prisma from './db.js';

async function fetchDataAndSave() {
  const API_KEY = process.env.DATA_GOV_API_KEY;
  const RESOURCE_ID = process.env.RESOURCE_ID;
  const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000&offset=0`;

  console.log('🤖 Starting data fetch from data.gov.in...');

  try {
    const response = await axios.get(API_URL);
    const data = response.data;

    if (data.status === 'error') {
      console.error('❌ API Error Message:', data.message);
      return;
    }

    const records = data.records;
    if (!records || records.length === 0) {
      console.log('📊 No records found in the API response. Exiting.');
      return;
    }

    console.log(`📊 Fetched ${records.length} records. Validating and preparing data...`);
    
    // --- UPDATED monthMap ---
    // Now handles both abbreviations and full names
    const monthMap = { 
      'Jan': 1, 'January': 1,
      'Feb': 2, 'February': 2,
      'Mar': 3, 'March': 3,
      'Apr': 4, 'April': 4,
      'May': 5, 'May': 5,
      'Jun': 6, 'June': 6, 
      'Jul': 7, 'July': 7,
      'Aug': 8, 'August': 8,
      'Sep': 9, 'September': 9,
      'Oct': 10, 'October': 10, 
      'Nov': 11, 'November': 11, 
      'Dec': 12, 'December': 12 
    };

    let processedRecords = [];
    let skippedCount = 0;

    // --- First, process and validate all records ---
    for (const record of records) {
      try {
        // 1. Validate and construct the date
        if (!record.fin_year || !record.month || !monthMap[record.month]) {
          throw new Error(`Missing or invalid fin_year ('${record.fin_year}') or month ('${record.month}')`);
        }
        
        const year = parseInt(record.fin_year.split('-')[0]);
        const month = monthMap[record.month]; 

        if (isNaN(year) || isNaN(month)) {
          throw new Error(`Could not parse year ('${record.fin_year}') or month ('${record.month}')`);
        }
        
        const recordDate = new Date(year, month - 1, 1); 
        
        if (isNaN(recordDate.getTime())) {
          throw new Error('Resulted in an Invalid Date object');
        }

        // 2. Validate and clean the district name
        let districtName = record.district_name;
        if (!districtName) {
          throw new Error(`"district_name" field is missing or null`);
        }
        districtName = districtName.trim(); // Clean whitespace

        // 3. Map all other fields
        const recordData = {
          data_for_date: recordDate,
          state_name: record.state_name,
          district_name: districtName,
          
          job_cards_issued: parseInt(record.Total_No_of_JobCards_issued) || null,
          total_active_workers: parseInt(record.Total_No_of_Active_Workers) || null,
          total_active_cards: parseInt(record.Total_No_of_Active_Job_Cards) || null,
          total_workers: parseInt(record.Total_No_of_Workers) || null,
          sc_active_workers: parseInt(record.SC_workers_against_active_workers) || null,
          st_active_workers: parseInt(record.ST_workers_against_active_workers) || null,
          approved_labour_budget: parseFloat(record.Approved_Labour_Budget) || null,
          persondays_liability: parseFloat(record.Persondays_of_Central_Liability_so_far) || null,
          sc_persondays: parseFloat(record.SC_persondays) || null,
          st_persondays: parseFloat(record.ST_persondays) || null,
          women_persondays: parseFloat(record.Women_Persondays) || null,
          avg_days_employment_per_hh: parseFloat(record.Average_days_of_employment_provided_per_Household) || null,
          avg_wage_rate: parseFloat(record.Average_Wage_rate_per_day_per_person) || null,
          hh_completed_100_days: parseInt(record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment) || null,
          total_households_worked: parseInt(record.Total_Households_Worked) || null,
          total_individuals_worked: parseInt(record.Total_Individuals_Worked) || null,
          differently_abled_worked: parseInt(record.Differently_abled_persons_worked) || null,
          gps_with_nil_exp: parseInt(record.Number_of_GPs_with_NIL_exp) || null,
          total_works_takenup: parseInt(record.Total_No_of_Works_Takenup) || null,
          ongoing_works: parseInt(record.Number_of_Ongoing_Works) || null,
          completed_works: parseInt(record.Number_of_Completed_Works) || null,
          pct_nrm_expenditure: parseFloat(record.percent_of_NRM_Expenditure) || null,
          pct_category_b_works: parseFloat(record.percent_of_Category_B_Works) || null,
          pct_agri_expenditure: parseFloat(record.percent_of_Expenditure_on_Agriculture_Allied_Works) || null,
          total_exp_lakhs: parseFloat(record.Total_Exp) || null,
          wages_lakhs: parseFloat(record.Wages) || null,
          material_skilled_wages_lakhs: parseFloat(record.Material_and_skilled_Wages) || null,
          admin_exp_lakhs: parseFloat(record.Total_Adm_Expenditure) || null,
        };
        
        // Add the clean data to our list
        processedRecords.push(recordData);
        
      } catch (validationError) {
        // If validation failed, log it and skip
        console.warn(`⚠️ Skipping record for district "${record.district_name || 'UNKNOWN'}": ${validationError.message}`);
        skippedCount++;
        continue;
      }
    }

    console.log(`Data validation complete. ${processedRecords.length} valid records found.`);
    if (skippedCount > 0) {
      console.log(`ℹ️ Skipped ${skippedCount} records during validation due to invalid data.`);
    }

    // --- NEW: De-duplication step ---
    const uniqueRecordsMap = new Map();
    for (const record of processedRecords) {
      const key = `${record.district_name}|${record.data_for_date.toISOString()}`;
      if (!uniqueRecordsMap.has(key)) {
        uniqueRecordsMap.set(key, record);
      }
    }
    const recordsToInsert = Array.from(uniqueRecordsMap.values());
    const duplicateCount = processedRecords.length - recordsToInsert.length;

    console.log(`ℹ️ Found and removed ${duplicateCount} duplicate records from the API data.`);
    console.log(`Data is clean. ${recordsToInsert.length} unique records ready for import.`);

    // --- Run as a Transaction ---
    console.log('Starting database transaction to refresh data...');
    
    const [deleteResult, createResult] = await prisma.$transaction([
      // 1. Delete all existing records
      prisma.mgnrega_performance.deleteMany({}),
      
      // 2. Create all new records
      prisma.mgnrega_performance.createMany({
        data: recordsToInsert,
        skipDuplicates: false, // We don't need this anymore, as we de-duplicated manually
      })
    ]);

    console.log(`✅ Successfully deleted ${deleteResult.count} old records.`);
    console.log(`✅ Successfully inserted ${createResult.count} new records.`);

  } catch (err) {
    console.error('❌ Scraper Error:', err.message);
    if (err.code) {
      console.error("Prisma Error Code:", err.code);
    }
    if (err.meta) {
       console.error("Prisma Error Meta:", err.meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

fetchDataAndSave();

