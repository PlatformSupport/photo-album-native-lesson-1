var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var enums = require("ui/enums");
var locationModule = require("location");
var LocationListenerImpl = (function (_super) {
    __extends(LocationListenerImpl, _super);
    function LocationListenerImpl() {
        _super.apply(this, arguments);
    }
    LocationListenerImpl.new = function () {
        return _super.new.call(this);
    };
    LocationListenerImpl.prototype.initWithLocationErrorOptions = function (location, error, options) {
        this._onLocation = location;
        if (error) {
            this._onError = error;
        }
        if (options) {
            this._options = options;
        }
        this._maximumAge = (this._options && ("number" === typeof this._options.maximumAge)) ? this._options.maximumAge : undefined;
        return this;
    };
    LocationListenerImpl.prototype.locationManagerDidUpdateLocations = function (manager, locations) {
        for (var i = 0; i < locations.count; i++) {
            var location = LocationManager._locationFromCLLocation(locations.objectAtIndex(i));
            if (this._maximumAge) {
                if (location.timestamp.valueOf() + this._maximumAge > new Date().valueOf()) {
                    this._onLocation(location);
                }
            }
            else {
                this._onLocation(location);
            }
        }
    };
    LocationListenerImpl.prototype.locationManagerDidFailWithError = function (manager, error) {
        if (this._onError) {
            this._onError(new Error(error.localizedDescription));
        }
    };
    LocationListenerImpl.ObjCProtocols = [CLLocationManagerDelegate];
    return LocationListenerImpl;
})(NSObject);
var LocationManager = (function () {
    function LocationManager() {
        this.desiredAccuracy = enums.Accuracy.any;
        this.updateDistance = kCLDistanceFilterNone;
        this.iosLocationManager = new CLLocationManager();
    }
    LocationManager._locationFromCLLocation = function (clLocation) {
        var location = new locationModule.Location();
        location.latitude = clLocation.coordinate.latitude;
        location.longitude = clLocation.coordinate.longitude;
        location.altitude = clLocation.altitude;
        location.horizontalAccuracy = clLocation.horizontalAccuracy;
        location.verticalAccuracy = clLocation.verticalAccuracy;
        location.speed = clLocation.speed;
        location.direction = clLocation.course;
        location.timestamp = new Date(clLocation.timestamp.timeIntervalSince1970 * 1000);
        location.ios = clLocation;
        return location;
    };
    LocationManager.iosLocationFromLocation = function (location) {
        var hAccuracy = location.horizontalAccuracy ? location.horizontalAccuracy : -1;
        var vAccuracy = location.verticalAccuracy ? location.verticalAccuracy : -1;
        var speed = location.speed ? location.speed : -1;
        var course = location.direction ? location.direction : -1;
        var altitude = location.altitude ? location.altitude : -1;
        var timestamp = location.timestamp ? NSDate.dateWithTimeIntervalSince1970(location.timestamp.getTime()) : null;
        var iosLocation = CLLocation.alloc().initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(CLLocationCoordinate2DMake(location.latitude, location.longitude), altitude, hAccuracy, vAccuracy, course, speed, timestamp);
        return iosLocation;
    };
    LocationManager.isEnabled = function () {
        if (CLLocationManager.locationServicesEnabled()) {
            return (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorized);
        }
        return false;
    };
    LocationManager.distance = function (loc1, loc2) {
        if (!loc1.ios) {
            loc1.ios = LocationManager.iosLocationFromLocation(loc1);
        }
        if (!loc2.ios) {
            loc2.ios = LocationManager.iosLocationFromLocation(loc2);
        }
        return loc1.ios.distanceFromLocation(loc2.ios);
    };
    LocationManager.prototype.startLocationMonitoring = function (onLocation, onError, options) {
        if (!this.listener) {
            if (options) {
                if (options.desiredAccuracy) {
                    this.desiredAccuracy = options.desiredAccuracy;
                }
                if (options.updateDistance) {
                    this.updateDistance = options.updateDistance;
                }
            }
            this.listener = LocationListenerImpl.new().initWithLocationErrorOptions(onLocation, onError, options);
            this.iosLocationManager.delegate = this.listener;
            this.iosLocationManager.desiredAccuracy = this.desiredAccuracy;
            this.iosLocationManager.distanceFilter = this.updateDistance;
            this.iosLocationManager.startUpdatingLocation();
        }
    };
    LocationManager.prototype.stopLocationMonitoring = function () {
        this.iosLocationManager.stopUpdatingLocation();
        this.iosLocationManager.delegate = null;
        this.listener = null;
    };
    Object.defineProperty(LocationManager.prototype, "lastKnownLocation", {
        get: function () {
            var clLocation = this.iosLocationManager.location;
            if (clLocation) {
                return LocationManager._locationFromCLLocation(clLocation);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    return LocationManager;
})();
exports.LocationManager = LocationManager;
