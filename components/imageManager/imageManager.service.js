angular.module('vln.imageManager').service('imageService', ($q, dataService, settings) => {
    return {
        create: create,
        getImage: getImage,
        getImages: getImages,
        removeImage: removeImage,
        removeImages: removeImages
    };

    function create(image) {
        return dataService.create(settings.api.images, image);
    }

    function removeImage(image) {
        return dataService.remove(settings.api.images, image.id);
    }

    function removeImages(images) {
        let defer = $q.defer();
        let promises = [];

        angular.forEach(images, (image) => {
            promises.push(removeImage(image));
        });

        $q.all(promises).then(() => {
            defer.resolve();
        });

        return defer.promise;
    }

    function getImage(id) {
        return dataService.get(settings.api.images, id);
    }

    function getImages(page, count, sort, options) {
        options = options || {};
        page = page || 1;
        count = count || 12;

        options.pagesize = count;
        options.startindex = (page - 1) * count;

        if (sort && sort.length) {
            options.sortby = sort[0].replace(' ', '+');
        }

        return dataService.getAll(settings.api.images, options);
    }
});
