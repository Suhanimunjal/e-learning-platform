"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AttendancePlugin = {
    name: 'attendance',
    version: '1.0.0',
    description: 'Student attendance tracking system',
    author: 'LMS Team',
    async init(context) {
        context.logger.log('Attendance plugin initialized');
        context.hooks.register('user.enrolled', async (data) => {
            context.logger.log('Attendance: User enrolled', data);
        });
        context.hooks.register('module.completed', async (data) => {
            context.logger.log('Attendance: Module completed', data);
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
exports.default = AttendancePlugin;
//# sourceMappingURL=attendance.plugin.js.map