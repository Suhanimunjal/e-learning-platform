import { LMSPlugin, PluginContext } from '../plugin.interface';

const AttendancePlugin: LMSPlugin = {
  name: 'attendance',
  version: '1.0.0',
  description: 'Student attendance tracking system',
  author: 'LMS Team',

  async init(context: PluginContext) {
    context.logger.log('Attendance plugin initialized');

    // Register hooks
    context.hooks.register('user.enrolled', async (data) => {
      context.logger.log('Attendance: User enrolled', data);
      // Create attendance record for new enrollment
    });

    context.hooks.register('module.completed', async (data) => {
      context.logger.log('Attendance: Module completed', data);
      // Update attendance record
    });
  },

  hooks: {
    'user.enrolled': async (data) => {
      console.log('Attendance plugin: User enrolled', data);
    },
    'module.completed': async (data) => {
      console.log('Attendance plugin: Module completed', data);
    },
  },
};

export default AttendancePlugin;
