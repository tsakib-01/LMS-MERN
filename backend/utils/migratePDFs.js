// backend/utils/migratePDFs.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'droudg5da';

// Define mini Schemas locally to avoid loading external model dependencies
const AssignmentSchema = new mongoose.Schema({
  attachments: [String]
});
const Assignment = mongoose.model('Assignment', AssignmentSchema);

const SubmissionSchema = new mongoose.Schema({
  files: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  file: String // student.js submission path
});
const Submission = mongoose.model('Submission', SubmissionSchema);

async function runMigration() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');
    console.log(`☁️ Using Cloudinary Cloud Name: ${CLOUD_NAME}`);

    let assignmentsHealed = 0;
    let submissionsHealed = 0;

    // ── 1. Migrate Assignments Attachments ─────────────────────────────
    console.log('\n🔍 Scanning Assignments...');
    const assignments = await Assignment.find({});
    for (const assignment of assignments) {
      let updated = false;
      const healedAttachments = assignment.attachments.map(att => {
        // If it starts with local relative path but references Cloudinary lms/ folder
        if (att && att.startsWith('/uploads/') && att.includes('/lms/')) {
          // Extract the Cloudinary filename (everything from 'lms/')
          const index = att.indexOf('lms/');
          if (index !== -1) {
            const cloudinaryFilename = att.substring(index);
            const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${cloudinaryFilename}`;
            console.log(`  ✨ Healing Assignment [${assignment._id}] attachment:`);
            console.log(`     From: "${att}"`);
            console.log(`     To:   "${cloudinaryUrl}"`);
            updated = true;
            assignmentsHealed++;
            return cloudinaryUrl;
          }
        }
        return att;
      });

      if (updated) {
        assignment.attachments = healedAttachments;
        await assignment.save();
      }
    }

    // ── 2. Migrate Submissions Files and File ───────────────────────────
    console.log('\n🔍 Scanning Submissions...');
    const submissions = await Submission.find({});
    for (const submission of submissions) {
      let updated = false;

      // Heal files array
      if (submission.files && submission.files.length > 0) {
        const healedFiles = submission.files.map(f => {
          if (f.path && f.path.startsWith('/uploads/') && f.path.includes('/lms/')) {
            const index = f.path.indexOf('lms/');
            if (index !== -1) {
              const cloudinaryFilename = f.path.substring(index);
              const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${cloudinaryFilename}`;
              console.log(`  ✨ Healing Submission [${submission._id}] files array item:`);
              console.log(`     From: "${f.path}"`);
              console.log(`     To:   "${cloudinaryUrl}"`);
              updated = true;
              submissionsHealed++;
              f.path = cloudinaryUrl;
            }
          }
          return f;
        });

        if (updated) {
          submission.files = healedFiles;
        }
      }

      // Heal single file field
      if (submission.file && submission.file.startsWith('/uploads/') && submission.file.includes('/lms/')) {
        const index = submission.file.indexOf('lms/');
        if (index !== -1) {
          const cloudinaryFilename = submission.file.substring(index);
          const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${cloudinaryFilename}`;
          console.log(`  ✨ Healing Submission [${submission._id}] single file:`);
          console.log(`     From: "${submission.file}"`);
          console.log(`     To:   "${cloudinaryUrl}"`);
          updated = true;
          submissionsHealed++;
          submission.file = cloudinaryUrl;
        }
      }

      if (updated) {
        // Mark modified since mongoose sometimes doesn't detect changes inside nested arrays/objects
        submission.markModified('files');
        await submission.save();
      }
    }

    console.log('\n==================================================');
    console.log('🎉 Migration Completed successfully!');
    console.log(`   - Assignments Healed: ${assignmentsHealed}`);
    console.log(`   - Submissions Healed: ${submissionsHealed}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('💥 Migration Failed with error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection to MongoDB closed.');
  }
}

runMigration();
