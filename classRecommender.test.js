const { findLeastBusyClassTimes } = require('./classRecommender');

describe('findLeastBusyClassTimes', () => {
    test('returns the least busy class times', () => {
        const students = [
            { id: 1, classes: [[540, 600], [660, 720], [840, 900]] },
            { id: 2, classes: [[540, 600], [660, 720], [900, 960]] },
            { id: 3, classes: [[540, 600], [780, 840], [960, 1020]] },
        ];

        const leastBusyTimes = findLeastBusyClassTimes(students);
        const first10 = leastBusyTimes.slice(0, 10);

        expect(first10).toEqual([
            'Monday 8:00am-9:00am (0 students)',
            'Monday 10:00am-11:00am (0 students)',
            'Monday 12:00pm-1:00pm (0 students)',
            'Monday 5:00pm-6:00pm (0 students)',
            'Tuesday 8:00am-9:00am (0 students)',
            'Tuesday 8:30am-9:30am (0 students)',
            'Tuesday 9:00am-10:00am (0 students)',
            'Tuesday 9:30am-10:30am (0 students)',
            'Tuesday 10:00am-11:00am (0 students)',
            'Tuesday 10:30am-11:30am (0 students)'
        ]);
    });
});