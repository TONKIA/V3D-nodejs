var data;
var componentIndex;

$().ready(function () {
    init();
});

//获取数据 初始化data
function init() {
    var url = document.location.toString();
    var arrUrl = url.split("share");
    var id = arrUrl[arrUrl.length - 1];
    //ajax请求数据
    $.post("/share" + id, function (reply) {
        //拒绝访问
        if (reply == 0)
            alert('Sorry, you have no access to this page.');
        //请求数据
        else if (reply == 1) {
            var reqData = {
                state: 1
            }
            $.ajax({
                type: "POST",
                url: "/shareData" + id,
                data: reqData,
                async: false, //同步请求，不然data会出问题
                success: function (remotaData) {
                    //给全局data赋值
                    if (remotaData.msg == 0) {
                        data = remotaData.data;
                        initUi();
                        initThree();
                        loadModel();
                        initEvent();
                    }
                    else
                        alert('Sorry, some problems have arisen.');
                }
            });
        }
        //密码访问
        else if (reply == 2) {
            $('#visitPasswordModal').modal('show');
            $('#visitBtn').click(function () {
                var password = $('#visitPassword').val().trim();
                var reqData = {
                    state: 2,
                    password: password
                }
                $.ajax({
                    type: "POST",
                    url: "/shareData" + id,
                    data: reqData,
                    async: false, //同步请求，不然data会出问题
                    success: function (remotaData) {
                        //给全局data赋值
                        if (remotaData.msg == 0) {
                            data = remotaData.data;
                            $('#visitPassword').val('');
                            $('#visitPasswordModal').modal('hide');
                            initUi();
                            initThree();
                            loadModel();
                            initEvent();
                        }
                        else {
                            $('#visitPassword').val('');
                            alert('Sorry, some problems have arisen.');
                        }
                    }
                });
            });
        } else {
            alert('Sorry, some problems have arisen.');
        }
    });
}

//------------------------------------------------------------------------------
//界面初始化


var swiperComponent;
var swiperModel;
var swiperTexture;

function initUi() {
    $('#ui').show();
    initComponentList();
    initSwiper();
}
function initComponentList() {
    for (var index in data.components) {
        $('#componentList').prepend("<div class= 'swiper-slide' > <div style='text-align: center; line-height:  50px;height: 50px;font-size: 20px'>" + data.components[index].name + "</div></div > ");
    }
}

function initSwiper() {

    swiperModel = new Swiper('#swiperModel', {
        grabCursor: true,
        spaceBetween: 20,
        slidesPerView: 3,
    })

    swiperTexture = new Swiper('#swiperTexture', {
        grabCursor: true,
        slidesPerView: 6,
        spaceBetween: 20,
    })

    swiperComponent = new Swiper('#swiperComponent', {
        grabCursor: true,
        direction: 'vertical',
        on: {
            slideChange: function () {
                componentIndex = this.activeIndex;
                freshModelList(this.activeIndex);
                freshTextureList(this.activeIndex);
            },
        },
    })
}

function freshModelList(componentIndex) {
    swiperModel.removeAllSlides();
    for (var index in data.components[componentIndex].models) {
        swiperModel.appendSlide('<div class="swiper-slide"><button class="btn btn-default" style="width:100%;" onclick="changeModel(' + index + ')">' + data.components[componentIndex].models[index].name + '</button></div>');
    }
}

function freshTextureList(componentIndex) {
    swiperTexture.removeAllSlides();
    for (var index in data.components[componentIndex].textures) {
        var fileName = data.components[componentIndex].textures[index].name;
        var fileId = data.components[componentIndex].textures[index].fileId;
        swiperTexture.appendSlide('<div class="swiper-slide"> <img src="/files/thumbnail/' + fileId + '" width="40px" height="40px" class="img-thumbnail" alt = "' + fileName + '" onclick="changeTexture(' + index + ')"> </div>');
    }
}
//点击事件：切换模型
function changeModel(index) {
    //先换贴图
    data.components[componentIndex].modelIndex = index;
    var textureIndex = data.components[componentIndex].textureIndex;
    changeTexture(textureIndex);
    //显示模型
    for (var i in data.components[componentIndex].models) {
        if (i == index) {
            data.components[componentIndex].models[i].modelObj.visible = true;
        } else {
            data.components[componentIndex].models[i].modelObj.visible = false;
        }
    }
}


//点击事件：切换贴图
function changeTexture(index) {
    if (componentIndex >= 0) {
        if (index < 0)
            return;
        var modelIndex = data.components[componentIndex].modelIndex;
        if (modelIndex < 0)
            return;
        data.components[componentIndex].textureIndex = index;
        replaceTexture(data.components[componentIndex].models[modelIndex].modelObj, data.components[componentIndex].textures[index].textureObj);
    }
}


//------------------------------------------------------------------------------
//threejs配置
function initThree() {
    initScene();
    initCamera();
    initRenderer();
    render();
}

function initScene() {
    //场景设置
    scene = new THREE.Scene();
    //设置天空盒
    scene.background = new THREE.CubeTextureLoader()
        .setPath('/img/skybox/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    //场景灯光
    //环境光
    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 2, 0);
    scene.add(light);
    //直射光
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 2, 1);
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = - 100;
    light.shadow.camera.left = - 120;
    light.shadow.camera.right = 120;
    scene.add(light);
    //grid
    var grid = new THREE.GridHelper(20, 20, 0x0000ff, 0xff0000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}

function initCamera() {
    //相机设置
    camera = new THREE.PerspectiveCamera(45, $('#viewField').innerWidth() / $('#viewField').innerHeight());
    camera.position.y = data.height;
    controls = new THREE.OrbitControls(camera, $('#viewField')[0]);
    controls.target.set(0, data.height, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.minDistance = data.distance;
    controls.maxDistance = data.distance;
    controls.enablePan = false;
    controls.enableKeys = false;
    controls.update();
}

function initRenderer() {
    //初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    //设置像素值
    renderer.setPixelRatio(window.devicePixelRatio);
    //设置渲染范围为屏幕的大小
    renderer.setSize($('#viewField').innerWidth(), $('#viewField').innerHeight());
    //将渲染结果放到页面中
    $('#viewField').append(renderer.domElement);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
//------------------------------------------------------------------------------
//初始化模型
function loadModel() {
    var manager = new THREE.LoadingManager();
    manager.onLoad = function () {
        initTexture();
    };
    //模型加载
    var loader = new THREE.FBXLoader(manager);
    for (var comIndex in data.components) {
        for (var molIndex in data.components[comIndex].models) {
            //异步加载问题
            (function (comIndex, molIndex) {
                var url = '/files/model/' + data.components[comIndex].models[molIndex].fileId;
                loader.load(url, function (object) {
                    object.visible = (data.components[comIndex].modelIndex == molIndex);
                    data.components[comIndex].models[molIndex].modelObj = object;
                    scene.add(object);
                }
                );
            })(comIndex, molIndex);
        }
    }
    //贴图加载
    var loader = new THREE.TextureLoader(manager);
    for (var comIndex in data.components) {
        for (var textureIndex in data.components[comIndex].textures) {
            //异步加载问题
            (function (comIndex, textureIndex) {
                var url = '/files/texture/' + data.components[comIndex].textures[textureIndex].fileId;
                loader.load(url, function (object) {
                    data.components[comIndex].textures[textureIndex].textureObj = object;
                }
                );
            })(comIndex, textureIndex);
        }
    }
}

//当模型和贴图都加载结束后，给模型赋予默认贴图
function initTexture() {
    for (var comIndex in data.components) {
        var modelIndex = data.components[comIndex].modelIndex;
        var textureIndex = data.components[comIndex].textureIndex;
        //赋贴图
        if (data.components[comIndex].models.length > 0 && data.components[comIndex].textures.length > 0)
            replaceTexture(data.components[comIndex].models[modelIndex].modelObj, data.components[comIndex].textures[textureIndex].textureObj);
    }
}
//------------------------------------------------------------------------------
//事件初始化
function initEvent() {
    //当浏览器大小变化时
    $(window).resize(function () {
        camera.aspect = $('#viewField').innerWidth() / $('#viewField').innerHeight();
        camera.updateProjectionMatrix();
        renderer.setSize($('#viewField').innerWidth(), $('#viewField').innerHeight());
    });
}

//------------------------------------------------------------------------------
//公用方法
function replaceTexture(modelObj, textureObj) {
    modelObj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = textureObj;
            child.material.castShadow = true;
            child.material.receiveShadow = true;
            child.material.needsUpdate = true;
        }
    });
}