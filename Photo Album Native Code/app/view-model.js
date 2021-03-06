var observable = require("data/observable");
var observableArrayModule = require("data/observable-array");
var imageSourceModule = require("image-source");
var fileSystemModule = require("file-system");

var directory = "/res/";

function imageFromSource(imageName) {
    return imageSourceModule.fromFile(fileSystemModule.path.join(__dirname, directory + imageName));
};

var array = new observableArrayModule.ObservableArray();

var item1 = {
    itemImage: imageFromSource("01.jpg")
};
var item2 = {
    itemImage: imageFromSource("02.jpg")
};
var item3 = {
    itemImage: imageFromSource("03.jpg")
};
var item4 = {
    itemImage: imageFromSource("04.jpg")
};
var item5 = {
    itemImage: imageFromSource("05.jpg")
};
var item6 = {
    itemImage: imageFromSource("06.jpg")
};

array.push([item1, item2, item3, item4, item5, item6]);

var item7 = {
    itemImage: imageFromSource("07.jpg")
};
var item8 = {
    itemImage: imageFromSource("08.jpg")
};

var photoAlbumModel = new observable.Observable();
photoAlbumModel.set("message", "Add new images");

Object.defineProperty(photoAlbumModel, "photoItems", {
    get: function () {
        return array;
    },
    enumerable: true,
    configurable: true
});

photoAlbumModel.tapAction = function () {
    array.push(item7);
    array.push(item8);

    this.set("message", "Images added. Total images: " + array.length);
};

exports.photoAlbumModel = photoAlbumModel;