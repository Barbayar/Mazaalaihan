function Dictionary(filename) {
    var request = $.ajax({
        url: filename,
        dataType: 'json',
        async: false,
    });

    this._data = request.responseJSON;
    log('loaded "' + filename + '"');
}

Dictionary.prototype.search = function(word) {
    throw 'Implement this method!';
}

function StemDictionary(filename, stemmer) {
    Dictionary.call(this, filename);
    this._stemmer = stemmer;
}

StemDictionary.prototype.search = function(word) {
    // adding '_' prefix to avoid conflicting with native methods of object type
    var stem = '_' + this._stemmer(word);

    if (typeof this._data[stem] === 'undefined') {
        log('"' + stem + '" is not found');

        return {
            found: false,
            result: [],
        };
    }

    log('"' + stem + '" is found');

    return {
        found: true,
        result: this._data[stem],
    }
}

function BinaryDictionary(filename) {
    Dictionary.call(this, filename);
}

BinaryDictionary.prototype._findNearestIndex = function(word, start, end) {
    if (typeof start === 'undefined') {
        start = 0;
        end = this._data.length;
    }

    if (start >= end) {
        return start;
    }

    var middle = Math.floor((start + end) / 2);
    var compareResult = word.localeCompare(this._data[middle][0]);

    if (compareResult === 0) {
        return middle;
    } else if (compareResult === -1) {
        return this._findNearestIndex(word, start, middle - 1);
    } else if (compareResult === 1) {
        return this._findNearestIndex(word, middle + 1, end);
    }
}

BinaryDictionary.prototype.search = function(word) {
    var nearestIndex = this._findNearestIndex(word);

    if (this._data[nearestIndex][0] === word) {
        log('"' + word + '" is found');

        return {
            found: true,
            result: [this._data[nearestIndex]],
        };
    }

    log('"' + word + '" is not found');

    var result = [];
    var start = nearestIndex - 3;
    var end = nearestIndex + 3;
    start = start < 0 ? 0 : start;
    end = end < this._data.length ? end : this._data.length - 1;

    for (var i = start; i <= end; i++) {
        result.push(this._data[i]);
    }

    return {
        found: false,
        result: result,
    };
}

engmon = new StemDictionary('data/engmon.json', snowballStemmer);
moneng = new BinaryDictionary('data/moneng.json');
