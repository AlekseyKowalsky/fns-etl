enum EDataStatuses {
    VALUE_CREATED = "created",
    VALUE_UPDATED = "updated",
    VALUE_DELETED = "deleted",
    VALUE_UNCHANGED = "unchanged",
}

export const deepDiffMapper = {
    map: function(obj1, obj2, ignoredFields?) {
        if (this.isFunction(obj1) || this.isFunction(obj2)) {
            throw "Invalid argument. Function given, object expected."
        }
        if (this.isValue(obj1) || this.isValue(obj2)) {
            const compared = this.compareValues(obj1, obj2)
            switch (compared) {
                case EDataStatuses.VALUE_UPDATED:
                    return {
                        type: compared,
                        oldData: obj1,
                        newData: obj2,
                    }
                case EDataStatuses.VALUE_CREATED:
                    return {
                        type: compared,
                        data: obj2,
                    }
                case EDataStatuses.VALUE_DELETED:
                    return {
                        type: compared,
                        data: obj1,
                    }
                case EDataStatuses.VALUE_UNCHANGED:
                    return {
                        type: compared,
                        data: obj1,
                    }
            }
        }

        const diff = {}

        for (const key in obj1) {
            if (ignoredFields.includes(key)) continue
            const res = this.map(obj1[key], obj2[key], ignoredFields)
            if (res) diff[key] = res
        }

        for (const key in obj2) {
            if (ignoredFields.includes(key)) continue
            if (diff[key] !== undefined) {
                if (diff[key]?.type === EDataStatuses.VALUE_UNCHANGED) {
                    delete diff[key]
                } else if (!Object.keys(diff[key]).length) {
                    delete diff[key]
                }
                continue
            }

            diff[key] = this.map(undefined, obj2[key], ignoredFields)
        }

        if (Object.keys(diff).filter((key) => isNaN(+key)).length) return diff

        return Object.values(diff)
    },
    compareValues: function(value1, value2) {
        if (value1 === value2) {
            return EDataStatuses.VALUE_UNCHANGED
        }
        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
            return EDataStatuses.VALUE_UNCHANGED
        }
        if (value1 === undefined) {
            return EDataStatuses.VALUE_CREATED
        }
        if (value2 === undefined) {
            return EDataStatuses.VALUE_DELETED
        }
        return EDataStatuses.VALUE_UPDATED
    },
    isFunction: function(x) {
        return Object.prototype.toString.call(x) === "[object Function]"
    },
    isArray: function(x) {
        return Object.prototype.toString.call(x) === "[object Array]"
    },
    isDate: function(x) {
        return Object.prototype.toString.call(x) === "[object Date]"
    },
    isObject: function(x) {
        return Object.prototype.toString.call(x) === "[object Object]"
    },
    isValue: function(x) {
        return !this.isObject(x) && !this.isArray(x)
    },
}
