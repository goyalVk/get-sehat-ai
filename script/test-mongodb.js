import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// === 1. USER ENGAGEMENT ANALYSIS ===
const analyzeUserEngagement = async (Report) => {
  console.log('\n📊 === USER ENGAGEMENT ANALYSIS ===\n');
  
  const engagement = await Report.aggregate([
    {
      $group: {
        _id: '$sessionId',
        totalReports: { $sum: 1 },
        totalUploadCount: { $sum: '$uploadCount' },
        avgUploadCount: { $avg: '$uploadCount' },
        firstVisit: { $min: '$createdAt' },
        lastVisit: { $max: '$createdAt' },
        hasProvidedFeedback: {
          $sum: {
            $cond: [{ $ne: ['$feedback.rating', null] }, 1, 0]
          }
        },
        avgRating: {
          $avg: {
            $cond: [{ $ne: ['$feedback.rating', null] }, '$feedback.rating', null]
          }
        }
      }
    },
    {
      $match: { _id: { $ne: null } }
    },
    {
      $sort: { totalReports: -1 }
    }
  ]);

  console.log(`Total Unique Sessions: ${engagement.length}`);
  console.log('\n🔥 Top 10 Most Active Users:');
  engagement.slice(0, 10).forEach((user, idx) => {
    console.log(`${idx + 1}. Session: ${user._id}`);
    console.log(`   Reports: ${user.totalReports} | Uploads: ${user.totalUploadCount} | Avg Upload/Report: ${user.avgUploadCount.toFixed(2)}`);
    console.log(`   First: ${new Date(user.firstVisit).toLocaleDateString()} | Last: ${new Date(user.lastVisit).toLocaleDateString()}`);
    console.log(`   Feedback: ${user.hasProvidedFeedback} | Avg Rating: ${user.avgRating ? user.avgRating.toFixed(1) : 'None'}/5`);
    console.log('');
  });

  return engagement;
};

// === 2. FEEDBACK & SATISFACTION ANALYSIS ===
const analyzeFeedback = async (Report) => {
  console.log('\n⭐ === FEEDBACK & SATISFACTION ANALYSIS ===\n');

  const feedbackStats = await Report.aggregate([
    {
      $match: { 'feedback.rating': { $ne: null } }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        avgRating: { $avg: '$feedback.rating' },
        ratingDistribution: {
          $push: '$feedback.rating'
        },
        usersWithClarifications: {
          $sum: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$feedback.clarifications', []] } }, 0] },
              1,
              0
            ]
          }
        },
        totalClarifications: {
          $sum: { $size: { $ifNull: ['$feedback.clarifications', []] } }
        }
      }
    }
  ]);

  if (feedbackStats.length > 0) {
    const stats = feedbackStats[0];
    const ratings = stats.ratingDistribution;
    
    const ratingCount = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    };

    console.log(`Total Ratings: ${stats.totalRatings}`);
    console.log(`Average Rating: ${stats.avgRating.toFixed(2)}/5`);
    console.log(`\nRating Distribution:`);
    console.log(`  ⭐⭐⭐⭐⭐ (5 stars): ${ratingCount[5]} (${((ratingCount[5]/stats.totalRatings)*100).toFixed(1)}%)`);
    console.log(`  ⭐⭐⭐⭐ (4 stars): ${ratingCount[4]} (${((ratingCount[4]/stats.totalRatings)*100).toFixed(1)}%)`);
    console.log(`  ⭐⭐⭐ (3 stars): ${ratingCount[3]} (${((ratingCount[3]/stats.totalRatings)*100).toFixed(1)}%)`);
    console.log(`  ⭐⭐ (2 stars): ${ratingCount[2]} (${((ratingCount[2]/stats.totalRatings)*100).toFixed(1)}%)`);
    console.log(`  ⭐ (1 star): ${ratingCount[1]} (${((ratingCount[1]/stats.totalRatings)*100).toFixed(1)}%)`);
    console.log(`\nUsers with Follow-up Questions: ${stats.usersWithClarifications}`);
    console.log(`Total Clarification Questions: ${stats.totalClarifications}`);
  } else {
    console.log('No feedback ratings found yet.');
  }

  // Top clarifications
  const clarifications = await Report.aggregate([
    {
      $match: { 'feedback.clarifications': { $exists: true, $ne: [] } }
    },
    {
      $unwind: '$feedback.clarifications'
    },
    {
      $group: {
        _id: '$feedback.clarifications.question',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  if (clarifications.length > 0) {
    console.log('\n🔍 Top 5 User Questions:');
    clarifications.forEach((q, idx) => {
      console.log(`${idx + 1}. "${q._id}" (${q.count} times)`);
    });
  }
};

// === 3. UPLOAD BEHAVIOR ANALYSIS ===
const analyzeUploadBehavior = async (Report) => {
  console.log('\n📤 === UPLOAD BEHAVIOR ANALYSIS ===\n');

  const uploadStats = await Report.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        totalUploads: { $sum: '$uploadCount' },
        avgUploadsPerReport: { $avg: '$uploadCount' },
        maxUploads: { $max: '$uploadCount' },
        minUploads: { $min: '$uploadCount' },
        reportsWithMultipleUploads: {
          $sum: { $cond: [{ $gt: ['$uploadCount', 1] }, 1, 0] }
        }
      }
    }
  ]);

  const stats = uploadStats[0];
  console.log(`Total Reports: ${stats.totalReports}`);
  console.log(`Total Uploads: ${stats.totalUploads}`);
  console.log(`Avg Uploads/Report: ${stats.avgUploadsPerReport.toFixed(2)}`);
  console.log(`Reports with Multiple Uploads: ${stats.reportsWithMultipleUploads} (${((stats.reportsWithMultipleUploads/stats.totalReports)*100).toFixed(1)}%)`);
  console.log(`Upload Range: ${stats.minUploads} - ${stats.maxUploads}`);

  // Upload frequency distribution
  const uploadDistribution = await Report.aggregate([
    {
      $group: {
        _id: '$uploadCount',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  console.log('\nUpload Count Distribution:');
  uploadDistribution.forEach(item => {
    console.log(`  ${item._id} upload(s): ${item.count} reports`);
  });
};

// === 4. REPORT ANALYSIS & PARAMETERS ===
const analyzeReportData = async (Report) => {
  console.log('\n📋 === REPORT ANALYSIS ===\n');

  const reportStats = await Report.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        completedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        processingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        failedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgAnalysisTime: { $avg: '$analysisTimeMs' },
        totalTokensUsed: { $sum: '$tokensUsed.totalTokens' },
        avgTokensPerReport: { $avg: '$tokensUsed.totalTokens' },
        totalCost: { $sum: '$tokensUsed.estimatedCost' }
      }
    }
  ]);

  const stats = reportStats[0];
  console.log(`Total Reports: ${stats.totalReports}`);
  console.log(`✅ Completed: ${stats.completedReports} (${((stats.completedReports/stats.totalReports)*100).toFixed(1)}%)`);
  console.log(`⏳ Processing: ${stats.processingReports}`);
  console.log(`❌ Failed: ${stats.failedReports} (${((stats.failedReports/stats.totalReports)*100).toFixed(1)}%)`);
  console.log(`\nAvg Analysis Time: ${stats.avgAnalysisTime.toFixed(0)}ms`);
  console.log(`Total Tokens Used: ${stats.totalTokensUsed}`);
  console.log(`Avg Tokens/Report: ${stats.avgTokensPerReport.toFixed(0)}`);
  console.log(`Estimated Total Cost: ₹${stats.totalCost.toFixed(2)}`);

  // Report types
  const reportTypes = await Report.aggregate([
    {
      $group: {
        _id: '$reportCategory',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  console.log('\n📊 Report Categories:');
  reportTypes.forEach(item => {
    console.log(`  ${item._id}: ${item.count} reports`);
  });

  // Models used
  const modelsUsed = await Report.aggregate([
    {
      $group: {
        _id: '$modelUsed',
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('\n🤖 AI Models Used:');
  modelsUsed.forEach(item => {
    console.log(`  ${item._id || 'Not specified'}: ${item.count} reports`);
  });
};

// === 5. CRITICAL HEALTH FLAGS ANALYSIS ===
const analyzeHealthFlags = async (Report) => {
  console.log('\n⚠️  === CRITICAL HEALTH FLAGS ===\n');

  const flagStats = await Report.aggregate([
    {
      $match: { urgentFlags: { $exists: true, $ne: [] } }
    },
    {
      $group: {
        _id: null,
        reportsWithFlags: { $sum: 1 },
        totalFlags: { $sum: { $size: '$urgentFlags' } }
      }
    }
  ]);

  if (flagStats.length > 0) {
    console.log(`Reports with Urgent Flags: ${flagStats[0].reportsWithFlags}`);
    console.log(`Total Flags: ${flagStats[0].totalFlags}`);
  }

  // Most common flags
  const commonFlags = await Report.aggregate([
    {
      $match: { urgentFlags: { $exists: true, $ne: [] } }
    },
    {
      $unwind: '$urgentFlags'
    },
    {
      $group: {
        _id: '$urgentFlags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  if (commonFlags.length > 0) {
    console.log('\n🚨 Top 10 Most Common Urgent Flags:');
    commonFlags.forEach((flag, idx) => {
      console.log(`${idx + 1}. ${flag._id} (${flag.count} times)`);
    });
  }
};

// === 6. TRAFFIC & TIMELINE ANALYSIS ===
const analyzeTraffic = async (Report) => {
  console.log('\n📈 === TRAFFIC & TIMELINE ANALYSIS ===\n');

  const dailyTraffic = await Report.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        reportsCount: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 1,
        reportsCount: 1,
        uniqueSessionsCount: { $size: '$uniqueSessions' },
        completedCount: 1
      }
    },
    {
      $sort: { _id: -1 }
    },
    {
      $limit: 14
    }
  ]);

  console.log('📅 Last 14 Days Activity:');
  dailyTraffic.reverse().forEach(day => {
    console.log(`${day._id}: ${day.reportsCount} reports | ${day.uniqueSessionsCount} unique sessions | ${day.completedCount} completed`);
  });
};

// === 7. SAMPLE vs REAL DATA ===
const analyzeSampleData = async (Report) => {
  console.log('\n🧪 === SAMPLE vs REAL DATA ===\n');

  const sampleStats = await Report.aggregate([
    {
      $group: {
        _id: '$isSample',
        count: { $sum: 1 }
      }
    }
  ]);

  sampleStats.forEach(stat => {
    const type = stat._id ? 'Sample' : 'Real User';
    console.log(`${type}: ${stat.count}`);
  });
};

// === 8. PATIENT DEMOGRAPHICS ===
const analyzeDemographics = async (Report) => {
  console.log('\n👥 === PATIENT DEMOGRAPHICS ===\n');

  const demographics = await Report.aggregate([
    {
      $match: { 'patient.gender': { $ne: null } }
    },
    {
      $group: {
        _id: '$patient.gender',
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('Gender Distribution:');
  demographics.forEach(item => {
    console.log(`  ${item._id}: ${item.count}`);
  });
};

// === 9. RETENTION & REPEAT USERS ===
const analyzeRetention = async (Report) => {
  console.log('\n🔄 === RETENTION & REPEAT USERS ===\n');

  const retention = await Report.aggregate([
    {
      $match: { sessionId: { $ne: null } }
    },
    {
      $group: {
        _id: '$sessionId',
        reportCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        oneTimeUsers: {
          $sum: { $cond: [{ $eq: ['$reportCount', 1] }, 1, 0] }
        },
        repeatingUsers: {
          $sum: { $cond: [{ $gt: ['$reportCount', 1] }, 1, 0] }
        },
        totalSessions: { $sum: 1 }
      }
    }
  ]);

  if (retention.length > 0) {
    const stats = retention[0];
    console.log(`Total Sessions: ${stats.totalSessions}`);
    console.log(`One-Time Users: ${stats.oneTimeUsers} (${((stats.oneTimeUsers/stats.totalSessions)*100).toFixed(1)}%)`);
    console.log(`Repeating Users: ${stats.repeatingUsers} (${((stats.repeatingUsers/stats.totalSessions)*100).toFixed(1)}%)`);
  }
};

// === 10. ERROR ANALYSIS ===
const analyzeErrors = async (Report) => {
  console.log('\n❌ === ERROR ANALYSIS ===\n');

  const errors = await Report.aggregate([
    {
      $match: { errorMessage: { $ne: null } }
    },
    {
      $group: {
        _id: '$errorMessage',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  if (errors.length > 0) {
    console.log('Top 10 Errors:');
    errors.forEach((error, idx) => {
      console.log(`${idx + 1}. ${error._id} (${error.count} times)`);
    });
  } else {
    console.log('No errors found!');
  }
};

// === MAIN EXECUTION ===
const runAllAnalysis = async () => {
  try {
    await connectDB();

    // Get Report model
    const reportSchema = new mongoose.Schema({}, { strict: false });
    const Report = mongoose.model('Report', reportSchema);

    console.log('\n🔍 SEHAT24 DATABASE DEEP ANALYSIS 🔍');
    console.log('=' .repeat(50));

    await analyzeUserEngagement(Report);
    await analyzeFeedback(Report);
    await analyzeUploadBehavior(Report);
    await analyzeReportData(Report);
    await analyzeHealthFlags(Report);
    await analyzeTraffic(Report);
    await analyzeSampleData(Report);
    await analyzeDemographics(Report);
    await analyzeRetention(Report);
    await analyzeErrors(Report);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Analysis Complete!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error running analysis:', error);
    process.exit(1);
  }
};

runAllAnalysis();