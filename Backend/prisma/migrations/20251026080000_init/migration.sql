-- CreateTable
CREATE TABLE "mgnrega_performance" (
    "id" SERIAL NOT NULL,
    "data_for_date" DATE NOT NULL,
    "state_name" TEXT,
    "district_name" TEXT NOT NULL,
    "job_cards_issued" INTEGER,
    "total_active_workers" INTEGER,
    "total_active_cards" INTEGER,
    "total_workers" INTEGER,
    "sc_active_workers" INTEGER,
    "st_active_workers" INTEGER,
    "approved_labour_budget" DECIMAL(65,30),
    "persondays_liability" DECIMAL(65,30),
    "sc_persondays" DECIMAL(65,30),
    "st_persondays" DECIMAL(65,30),
    "women_persondays" DECIMAL(65,30),
    "avg_days_employment_per_hh" DECIMAL(65,30),
    "avg_wage_rate" DECIMAL(65,30),
    "hh_completed_100_days" INTEGER,
    "total_households_worked" INTEGER,
    "total_individuals_worked" INTEGER,
    "differently_abled_worked" INTEGER,
    "gps_with_nil_exp" INTEGER,
    "total_works_takenup" INTEGER,
    "ongoing_works" INTEGER,
    "completed_works" INTEGER,
    "pct_nrm_expenditure" DECIMAL(65,30),
    "pct_category_b_works" DECIMAL(65,30),
    "pct_agri_expenditure" DECIMAL(65,30),
    "total_exp_lakhs" DECIMAL(65,30),
    "wages_lakhs" DECIMAL(65,30),
    "material_skilled_wages_lakhs" DECIMAL(65,30),
    "admin_exp_lakhs" DECIMAL(65,30),

    CONSTRAINT "mgnrega_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mgnrega_performance_district_name_data_for_date_key" ON "mgnrega_performance"("district_name", "data_for_date");
