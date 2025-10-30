import prisma from '../db.js';

/**
 * @desc Get a unique list of all state names
 * @route GET /api/v1/performance/states
 */
export const getAllStates = async (req, res) => {
  try {
    const states = await prisma.mgnrega_performance.findMany({
      select: {
        state_name: true,
      },
      distinct: ['state_name'],
      orderBy: {
        state_name: 'asc',
      },
    });

    // Extract just the names and filter out any null/empty values
    const stateNames = states
      .map(s => s.state_name)
      .filter(name => name); // Ensure name is not null or empty

    res.status(200).json({ states: stateNames });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ msg: 'An internal server error occurred' });
  }
};

/**
 * @desc Get a unique list of district names, optionally filtered by state
 * @route GET /api/v1/performance/districts
 * @queryParam state - Optional state name to filter districts
 */
export const getAllDistricts = async (req, res) => {
  try {
    const { state } = req.query; // Get state from query parameter
    let whereClause = {};

    if (state) {
      // Add state filter if provided (case-insensitive)
      whereClause = {
        state_name: {
          equals: state,
          mode: 'insensitive',
        },
      };
    }

    const districts = await prisma.mgnrega_performance.findMany({
      where: whereClause, // Apply the filter
      select: {
        district_name: true,
      },
      distinct: ['district_name'],
      orderBy: {
        district_name: 'asc',
      },
    });

    // Extract just the names and filter out any null/empty values
    const districtNames = districts
      .map(d => d.district_name)
      .filter(name => name); // Ensure name is not null or empty

    res.status(200).json({ districts: districtNames });
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ msg: 'An internal server error occurred' });
  }
};


/**
 * @desc Get latest performance data for one district
 * @route GET /api/v1/performance/:district
 */
export const getLatestByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    const performanceData = await prisma.mgnrega_performance.findFirst({
      where: {
        district_name: {
          equals: district,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      orderBy: {
        data_for_date: 'desc', // Get the most recent entry
      },
    });

    if (!performanceData) {
      return res.status(404).json({ msg: `No data found for district: ${district}` });
    }

    res.status(200).json({ data: performanceData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'An internal server error occurred' });
  }
};

/**
 * @desc Get all historical performance data for one district
 * @route GET /api/v1/performance/history/:district
 */
export const getHistoryByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    const historyData = await prisma.mgnrega_performance.findMany({
      where: {
        district_name: {
          equals: district,
          mode: 'insensitive',
        },
      },
      orderBy: {
        data_for_date: 'desc', // Get newest first
      },
    });

    if (!historyData || historyData.length === 0) {
      return res.status(404).json({ msg: `No history data found for district: ${district}` });
    }

    res.status(200).json({ data: historyData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'An internal server error occurred' });
  }
};

