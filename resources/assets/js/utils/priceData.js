/**
 * Created by Rocky on 1/19/2017.
 */

module.exports = {
    NormalDensityZx: function (x, Mean, StdDev) {
        var a = x - Mean;

        return Math.exp(-(a * a) / (2 * StdDev * StdDev)) / (Math.sqrt(2 * Math.PI) * StdDev);
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    },
    getNumWithSetDec: function( num, numOfDec ){
    var pow10s = Math.pow( 10, numOfDec || 0 );
    return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
},
    getAverageFromNumArr: function( numArr, numOfDec ){
        if( !this.isArray( numArr ) ){ return false;	}
        var i = numArr.length,
            sum = 0;
        while( i-- ){
            sum += numArr[ i ];
        }
        return this.getNumWithSetDec( (sum / numArr.length ), numOfDec );
    },
    getVariance: function( numArr, numOfDec ){
        if( !this.isArray(numArr) ){ return false; }
        var avg = this.getAverageFromNumArr( numArr, numOfDec ),
            i = numArr.length,
            v = 0;

        while( i-- ){
            v += Math.pow( (numArr[ i ] - avg), 2 );
        }
        v /= numArr.length;
        return this.getNumWithSetDec( v, numOfDec );
    },
    getStandardDeviation: function( numArr, numOfDec ){
        if( !this.isArray(numArr) ){ return false; }
        var stdDev = Math.sqrt( this.getVariance( numArr, numOfDec ) );
        return this.getNumWithSetDec( stdDev, numOfDec );
    },
    arrayMean: function(numArr){
        if(!this.isArray(numArr)){return false;}
        var total = 0;
        for(var i = 0; i < numArr.length; i++)
            total += numArr[i];
        return total / numArr.length;
    }
};
