describe('Image Manager Directive', function() {
    beforeEach(module('app'));
    beforeEach(module('vln.imageManager', ($provide) => {
        $provide.decorator('$mdToast', function($delegate) {
            spyOn($delegate, 'show').and.callThrough();
            spyOn($delegate, 'simple').and.callThrough();
            return $delegate;
        });

        $provide.decorator('$mdDialog', function($delegate) {
            spyOn($delegate, 'show').and.callThrough();
            return $delegate;
        });
    }));

    var $rootScope;
    var $mdDialog;
    var $mdToast;
    var element;
    var scope;
    var isolateScope;
    var $httpBackend;
    var Upload;
    var template;
    var editorSpy;
    var imageReader;
    var $q;
    var templateUrl = 'components/imageManager/imageManager.html';

    var imageList = [
        { imageLink: { fullUri: 'test' } }
    ];

    beforeEach(inject((_$rootScope_, $compile, $templateCache, _$httpBackend_, $window, _$mdToast_, _Upload_, _$mdDialog_, _imageReader_, _$q_) => {
        $mdToast = _$mdToast_;
        Upload = _Upload_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $mdDialog = _$mdDialog_;
        imageReader = _imageReader_;
        $q = _$q_;

        scope = $rootScope.$new();
        scope.imageList = angular.copy(imageList);

        $httpBackend.whenGET(/locale/).respond({
            'ERROR.UPLOADERROR.TEXT': 'TEST {{IMAGE}}'
        });

        editorSpy = jasmine.createSpyObj('editor', ['launch', 'close', 'hideWaitIndicator', 'showWaitIndicator']);

        $window.Aviary = {
            Feather: () => editorSpy
        };

        template = $templateCache.get(templateUrl);

        $httpBackend.whenGET(/.*/).respond({});
        $httpBackend.whenGET(templateUrl).respond(template);
        $httpBackend.whenGET(/storeinformation/).respond('undefined');
        element = $compile("<image-manager images='imageList'></image-manager>")(scope);
        scope.$digest();

        isolateScope = element.isolateScope();
    }));

    it('Has a view model', () => {
        expect(isolateScope.vm).not.toBe(null);
    });

    it('Registers a scroller', () => {
        expect(isolateScope.vm.scroller).not.toBe(null);
        expect(typeof isolateScope.vm.scroller.scrollLeft).toBe('function');
        expect(typeof isolateScope.vm.scroller.scrollRight).toBe('function');
    });

    it('Displays Error on failed uploads', () => {

        var rejected = [{
            name: 'testImage'
        }];

        isolateScope.vm.uploadImages(null, rejected);
        $httpBackend.flush();
        expect($mdToast.simple).toHaveBeenCalled();
        expect($mdToast.show).toHaveBeenCalled();
    });

    it('Calls uploadFile for each file', () => {
        var success = [
            { name: 'test1' },
            { name: 'test2' }
        ];
	                                            spyOn(imageReader, 'getImageData').and.returnValue($q.when('foo'));
        isolateScope.vm.uploadImages(success);
        expect(imageReader.getImageData.calls.count()).toEqual(2);
    });

    it('Appends new uploads to existing pending uploads', () => {
        var success = [
            { name: 'test1' },
            { name: 'test2' }
        ];
        isolateScope.vm.uploadImages([success[0]]);
        expect(isolateScope.vm.files).toEqual([success[0]]);
        isolateScope.vm.uploadImages([success[1]]);
        expect(isolateScope.vm.files).toEqual(success);
    });

    it('Opens image metadata modal', () => {
        isolateScope.vm.openImageMetadataModal('test');
        expect(isolateScope.vm.selectedImage).toEqual('test');
        expect($mdDialog.show).toHaveBeenCalled();
    });

    it('Removes an image', () => {
        isolateScope.vm.removeImage(imageList[0]);
        expect(isolateScope.images.length).toEqual(0);
    });

    it('Open the image editor', () => {
        isolateScope.vm.openEditor(imageList[0]);
        expect(isolateScope.vm.selectedImage).toEqual(imageList[0]);
        expect(editorSpy.launch).toHaveBeenCalled();
    });

    it('Saves the edited image', () => {
        isolateScope.vm.saveEditor();
        expect(editorSpy.showWaitIndicator).toHaveBeenCalled();
        expect(editorSpy.hideWaitIndicator).toHaveBeenCalled();
        expect(editorSpy.close).toHaveBeenCalled();
    });

});
