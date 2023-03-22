const { findLeastBusyClassTimes } = require('./classRecommender');

describe('findLeastBusyClassTimes', () => {
    test('returns the least busy class times', () => {
        const students = [
            { id: 1, classes: [[540, 600], [660, 720], [840, 900]] },
            { id: 2, classes: [[540, 600], [660, 720], [900, 960]] },
            { id: 3, classes: [[540, 600], [780, 840], [960, 1020]] },
        ];

        const leastBusyTimes = findLeastBusyClassTimes(students);

        expect(leastBusyTimes).toEqual([
            'Monday 10:00am-11:00am (0 students)',
            'Monday 4:00pm-5:00pm (0 students)',
            'Tuesday 10:00am-11:00am (0 students)',
            'Tuesday 4:00pm-5:00pm (0 students)',
            'Wednesday 10:00am-11:00am (0 students)',
            'Wednesday 4:00pm-5:00pm (0 students)',
            'Thursday 10:00am-11:00am (0 students)',
            'Thursday 4:00pm-5:00pm (0 students)',
            'Friday 10:00am-11:00am (0 students)',
            'Friday 4:00pm-5:00pm (0 students)',
        ]);
    });
});