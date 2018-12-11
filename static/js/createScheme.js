var renderer, scene, camera;

//整个页面维护的数据
//var data = { name: '默认方案', components: [] };
//TODO 相机参数
var data;

//当前选择的部件
var componentIndex = -1;

$().ready(function () {
    initData();
    initUi();
    initThree();
    loadmodel();
    initEvent();
});

//初始化Threejs
function initThree() {
    initScene();
    initCamera();
    initRenderer();
    render();
}

//获取数据 初始化data
function initData() {
    //ajax请求数据
    $.ajax({
        type: "POST",
        url: "/getScheme",
        async: false, //同步请求，不然data会出问题
        success: function (remotaData) {
            data = remotaData;
        },
        error: function () {
            //TODO 初始化数据异常
        }
    });
}

//刷新主Ui，方案名，部件列表
function initUi() {
    //方案名
    $('#schemeName').val(data.name);
    //组件列表
    freshComponentItem();
}

function freshComponentItem() {
    //清空原有列表
    $('.componentItem').remove();
    for (var index in data.components) {
        //添加一个item并注册了click监听
        $('#componentList').prepend("<li class='componentItem' onclick='selectComponent(" + index + ")'><a>" + data.components[index].name + "</a></li>");
    }
}

//选择部件
function selectComponent(index) {
    componentIndex = index;
    $('#componentTitle').text(data.components[componentIndex].name);
    $('#delComponent').show();
    $('#textureManagerment').show();
    $('#upload').removeClass("disabled");
    //加载模型列表
    freshmodelList();
}

//刷新模型的选择列表
function freshmodelList() {
    $('.list-group-item').remove();
    if (data.components[componentIndex].models.length == 0) {
        $('#modelList').append('<a class="list-group-item">暂无模型</a>')
    } else {
        // if (data.components[componentIndex].modelIndex == -1)
        //     data.components[componentIndex].modelIndex = 0;
        for (var index in data.components[componentIndex].models) {
            if (index == data.components[componentIndex].modelIndex) {
                data.components[componentIndex].models[index].modelObj.visible = true;
                $('#modelList').append("<a class='list-group-item active' onclick='selectModel(" + index + ")'><span>" + data.components[componentIndex].models[index].name + "</span><button type='button' class='close' onclick='delModelItem(" + index + ")'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button></a>");
            } else {
                data.components[componentIndex].models[index].modelObj.visible = false;
                $('#modelList').append("<a class='list-group-item' onclick='selectModel(" + index + ")'><span>" + data.components[componentIndex].models[index].name + "</span><button type='button' class='close' onclick='delModelItem(" + index + ")'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button></a>");
            }
        }
    }
}

//选择模型
function selectModel(index) {
    data.components[componentIndex].modelIndex = index;
    freshmodelList();
}
//删除模型
function delModelItem(index) {
    scene.remove(data.components[componentIndex].models[index].modelObj);
    data.components[componentIndex].models.splice(index, 1);
    selectModel(0);
}

//初始化模型
function loadmodel() {
    var manager = new THREE.LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    manager.onLoad = function () {
        initUi();
        console.log('Loading complete!');
    };
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    manager.onError = function (url) {
        console.log('There was an error loading ' + url);
    };
    var loader = new THREE.FBXLoader(manager);
    for (var comIndex in data.components) {
        for (var molIndex in data.components[comIndex].models) {
            //异步加载问题
            (function (comIndex, molIndex) {
                var url = '/files/' + data.components[comIndex].models[molIndex].fileId;
                loader.load(url, function (object) {
                    // object.traverse(function (child) {
                    //     if (child instanceof THREE.Mesh) {
                    //         child.material.castShadow = true;
                    //         child.material.receiveShadow = true;
                    //         child.material.needsUpdate = true;
                    //     }
                    // });
                    object.visible = (data.components[comIndex].modelIndex == molIndex);
                    data.components[comIndex].models[molIndex].modelObj = object;
                    scene.add(object);
                }
                );
            })(comIndex, molIndex);
        }
    }
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
    camera.position.set(0, 5, 10);
    //让相机对着场景中央
    camera.lookAt(scene.position);
    //相机控制,控制的相机和监听的dom
    controls = new THREE.OrbitControls(camera, $('#viewField')[0]);
    controls.target.set(0, 0, 0);
    controls.update();
}

function initRenderer() {
    //初始化渲染器
    renderer = new THREE.WebGLRenderer();
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

//初始化所有事件
function initEvent() {
    $('#saveScheme').click(function () {
        console.info(data);
        $.ajax({
            type: "POST",
            url: "/saveScheme",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data)
        });
    });

    //方案名变动监听
    $('#schemeName').change(function () {
        data.name = $('#schemeName').val();
    });

    //将fileinput事件注册到uploadbtn上
    $("#upload").click(function () {
        $("#file").click();
    });

    //只要file发生改变就上传文件
    $("#file").change(function () {
        if ($(this).val().length > 0) {
            var formData = new FormData($('#uploadForm')[0]);
            $.ajax({
                type: 'post',
                url: "/upload",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                success: function (fileData) {
                    //上传成功后加载模型
                    //加载是异步的
                    var addModelItem = function (modelObj) {
                        data.components[componentIndex].models.push({
                            name: fileData.originalname,
                            fileId: fileData.filename,
                            modelObj: modelObj
                        });
                        selectModel(data.components[componentIndex].models.length - 1);
                    }
                    addModel('/files/' + fileData.filename, addModelItem);
                },
                error: function () {
                    alert("上传失败")
                }
            });
        }
    });

    //当浏览器大小变化时
    $(window).resize(function () {
        camera.aspect = $('#viewField').innerWidth() / $('#viewField').innerHeight();
        camera.updateProjectionMatrix();
        renderer.setSize($('#viewField').innerWidth(), $('#viewField').innerHeight());
    });

    //当模态框消失的时候清空text
    $('#addComponentModal').on('hidden.zui.modal', function () {
        $("#componentName").val("")
    });

    //添加一个部件
    $('#addComponent').click(function () {
        var componentName = $("#componentName").val().trim();
        if (componentName.length > 0) {
            var component = {
                name: componentName,
                models: [],
                modelIndex: -1,
                textures: [],
                textureIndex: -1
            }
            data.components.push(component);
            freshComponentItem();
            $('#addComponentModal').modal('hide');
        }
    });

    //删除部件
    $('#delComponent').click(function () {
        new $.zui.Messager('你确定要删除该部件吗，该部件的所有模型将会被清空！', {
            type: 'danger',
            close: false,
            actions: [{
                icon: 'ok-sign',
                text: '确定',
                action: function () {  // 点击该操作按钮的回调函数
                    if (componentIndex >= 0) {
                        for (var index in data.components[componentIndex].models)
                            scene.remove(data.components[componentIndex].models[index].modelObj);
                        data.components.splice(componentIndex, 1);
                        freshComponentItem();
                        componentIndex = -1;
                        $('#componentTitle').text('请先选择部件');
                        $('#textureManagerment').hide();
                        $('#delComponent').hide();
                        $('#upload').addClass("disabled");
                        $('.list-group-item').remove();
                        //todo 还需要发送ajax清空模型文件
                    }
                }
            }, {
                icon: 'times',
                text: '取消',
            }]
        }).show();
    });

    $('#textureManagerment').click(function () {
        $('#textureManagermentModal').modal('show');
    });
}

// 选择上传完成后加载模型
function addModel(url, callBack) {
    //var map = new THREE.TextureLoader().load('/img/texture/001.jpg');
    //加载obj模型
    // loader = new THREE.OBJLoader();
    // loader.load(url, function (object) {
    //     object.position.set(0, -1, 0);
    //     object.scale.set(0.01, 0.01, 0.01);
    //     scene.add(object);
    // });
    //加载fbx模型
    var loader = new THREE.FBXLoader();
    loader.load(url, function (object) {
        object.traverse(function (child) {
            // if (child instanceof THREE.Mesh) {
            //     child.material.map = map;
            //     child.material.castShadow = true;
            //     child.material.receiveShadow = true;
            //     child.material.needsUpdate = true;
            // }
        });
        scene.add(object);
        callBack(object);
    }, function (xhr) {
        //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (err) {
        console.error('An error happened');
    }
    );
}

