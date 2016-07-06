angular.module('vln.imageManager')
.directive('imageManager', (
    $window, $translate, $mdToast, $timeout, modelService, $mdDialog, imageReader, imagesService
) => {
    return {
        restrict: 'E',
        templateUrl: 'components/imageManager/imageManager.html',
        scope: {
            images: '=',
            image: '=',
            singleMode: '=',
            galleryMode: '=',
            imageLibraryContext: '@',
            imageLibraryAssociationTags: '=',
            size: '@'
        },
        link: (scope, ele, attrs) => {
            var vm = scope.vm;
            scope.gtmid = attrs.gtmid || null;

            scope.vm.editor = new Aviary.Feather({
                apiKey: '123456',
                onSaveButtonClicked: vm.saveEditor,
                theme: 'minimum',
                tools: ['frames', 'orientation', 'crop', 'resize', 'lighting', 'color', 'sharpness', 'text'],
                onLoad: () => {
                    angular.element('#avpw_fullscreen_bg').on('click', () => {
                        vm.editor.close();
                    });
                }
            });

            /*
             var dz = angular.element('.image-manager__dropzone');
             var body = angular.element('body');
             var container = angular.element('.image-manager__container');

             body.on('vln:drag', (e, pos) => {
             var containerPos = container.offset();
             var containerLeft = containerPos.left;
             var containerRight = containerPos.left + container.width();

             if (pos.x < containerLeft) {
             vm.scroller.scrollLeft();
             } else if (pos.x > containerRight) {
             vm.scroller.scrollRight();
             }
             });

             body.on('dragover', (e) => {
             //Only activate if dragging a file

             var dataTypes = e.originalEvent.dataTransfer.types;
             var isFile = Array.isArray(dataTypes) ?
             dataTypes.indexOf('Files') !== -1 :
             dataTypes.contains('Files');

             if (isFile) {
             dz.css('pointer-events', 'auto');
             }
             });

             body.on('dragleave', (e) => {
             var target = angular.element(e.target);

             if (target.is(dz)) {
             dz.css('pointer-events', 'none');
             }
             });

             body.on('dragend', () => {
             dz.css('pointer-events', 'none');
             });

             body.on('drop', () => {
             dz.css('pointer-events', 'none');
             });

             scope.$on('$destroy', () => {
             angular.element('body').off('dragover');
             angular.element('body').off('drop');
             angular.element('body').off('dragend');
             angular.element('body').off('dragleave');
             angular.element('#avpw_fullscreen_bg').off('click');
             });*/
        },

        controller: function imageManagerController($scope) {
            this.registerScroller = registerScroller;

            var vm = {
                files: [],
                singleMode: $scope.singleMode,
                size: $scope.size || 'lg',
                galleryMode: $scope.galleryMode,
                croppedImage: null,
                scroller: null,
                cropHeight: 0,
                cropWidth: 0,

                onLibraryImagesSelected: onLibraryImagesSelected,
                uploadImages: uploadImages,
                openEditor: openEditor,
                saveEditor: saveEditor,
                openImageMetadataModal: openImageMetadataModal,
                removeImage: removeImage,
                trackDrop: trackDrop
            };

            init();

            function init() {
                $scope.vm = vm;

                $scope.$on('resetImages', () => {
                    vm.scroller.resetScroll();
                });
            }

            function onLibraryImagesSelected(selectedImages) {
                if (Array.isArray(selectedImages)) {
                    angular.forEach(selectedImages, (image) => {
                        var newImage = {
                            imageLink: image
                        };
                        $scope.images.push(modelService.makeModel(newImage, 'imageMetadataModel'));
                    });
                } else {
                    let newImage = {
                        imageLink: selectedImages
                    };

                    $scope.image = modelService.makeModel(newImage, 'imageMetadataModel');
                }
            }

            function registerScroller(scroller) {
                vm.scroller = scroller;
            }

            function uploadImages(files, rejected) {
                if (rejected && rejected.length) {
                    $translate('ERROR.IMAGEVALIDATION.TEXT').then((error) => {
                        $mdToast.show($mdToast.simple()
                        .textContent(error)
                        .position('bottom left')
                        );
                    });
                }

                if (!files) {
                    return;
                }

                vm.files = vm.files.concat(files);
                files.forEach(file => uploadFile(file));
                $window.dataLayer.push({
                    event: `${$scope.gtmid}-uploadImage`
                });
            }

            function uploadFile(file, idx) {
                file.progress = 0;
                imageReader.getImageData(file)
                .then((data) => {
                    return imagesService.saveImage(data);
                }, () => {
                    _.remove(vm.files, file);
                }, (completedPercentage) => {
                    file.progress = completedPercentage;
                })
                .then((response) => {
                    _.remove(vm.files, file);
                    var newImage = {
                        imageLink: response
                    };

                    if (vm.singleMode) {
                        $scope.image = modelService.makeModel(newImage, 'imageMetadataModel');
                    } else {
                        if (idx != null) {
                            newImage = _.extend({}, $scope.images[idx], newImage);
                            $scope.images.splice(idx, 1, modelService.makeModel(newImage, 'imageMetadataModel'));
                        } else {
                            $scope.images.push(modelService.makeModel(newImage, 'imageMetadataModel'));
                        }
                    }
                })
                .catch(() => {
                    _.remove(vm.files, file);
                });
            }

            function openImageMetadataModal(image) {
                $window.dataLayer.push({
                    event: `${$scope.gtmid}-imageMetadata`
                });
                vm.selectedImage = angular.copy(image);

                let dialogOptions = {
                    clickOutsideToClose: true,
                    templateUrl: 'components/imageManager/components/image.metadata.modal.html',
                    scope: $scope,
                    preserveScope: true,
                    controller: 'vlnDialogController'
                };

                return $mdDialog.show(dialogOptions)
                .then(() => {
                    if (vm.singleMode) {
                        $scope.image = vm.selectedImage;
                    } else {
                        var idx = $scope.images.indexOf(image);
                        $scope.images.splice(idx, 1, vm.selectedImage);
                    }
                });
            }

            function removeImage(image) {
                $window.dataLayer.push({
                    event: `${$scope.gtmid}-removeImage`
                });

                if (vm.singleMode) {
                    $scope.image = null;
                } else {
                    var idx = $scope.images.indexOf(image);
                    $scope.images.splice(idx, 1);
                }

                $timeout(() => {
                    vm.scroller.moveIntoPosition();
                });
            }

            function trackDrop() {
                $window.dataLayer.push({
                    event: `${$scope.gtmid}-dropImage`
                });
            }

            function openEditor(image) {
                $window.dataLayer.push({
                    event: `${$scope.gtmid}-editImage`
                });
                vm.selectedImage = image;
                var img = document.createElement('img');
                img.src = image.imageLink.fullUri;

                vm.editor.launch({
                    image: img,
                    url: image.imageLink.fullUri
                });
                return false;
            }

            function closeEditor() {
                vm.editor.hideWaitIndicator();
                vm.editor.close();
            }

            function saveEditor() {
                vm.editor.showWaitIndicator();
                var modifiedImage = getImageFromCanvas();

                if (modifiedImage) {
                    if (vm.singleMode) {
                        uploadFile(modifiedImage);
                    } else {
                        var idx = $scope.images.indexOf(vm.selectedImage);
                        uploadFile(modifiedImage, idx);
                    }
                }

                closeEditor();
                return false;
            }

            function getImageFromCanvas() {
                var editorCanvas = document.getElementById('avpw_canvas_element');
                var modifiedImage = null;

                if (editorCanvas) {
                    modifiedImage = getImageBlob(editorCanvas.toDataURL());
                    modifiedImage.name = 'cropped.png';
                }

                return modifiedImage;
            }

            function getImageBlob(dataUrl) {
                var arrBuffer;
                var byteString;
                var i;
                var intArray;
                var mimeString;

                byteString = atob(dataUrl.split(',')[1]);
                mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                arrBuffer = new ArrayBuffer(byteString.length);
                intArray = new Uint8Array(arrBuffer);
                i = 0;
                while (i < byteString.length) {
                    intArray[i] = byteString.charCodeAt(i);
                    i++;
                }

                return new Blob([intArray], {
                    type: mimeString
                });
            }
        }
    };
});
