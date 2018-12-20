//全局变量
var renderer, scene, camera, controls;
var totalFinish = 0;
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
    loadModel();
    initEvent();
});

//---------------------------------------------------------------------------------------------------------------------
//获取数据 初始化data
function initData() {
    var url = document.location.toString();
    var arrUrl = url.split("create");
    var id = arrUrl[arrUrl.length - 1];
    //ajax请求数据
    $.ajax({
        type: "POST",
        url: "/getScheme" + id,
        async: false, //同步请求，不然data会出问题
        success: function (remotaData) {
            //给全局data赋值
            data = remotaData;
        },
        error: function () {
            //TODO 初始化数据异常
        }
    });
}

//---------------------------------------------------------------------------------------------------------------------
//获取全局data后
//刷新主Ui，方案名，部件列表
function initUi() {
    //刷新方案名
    $('#schemeName').val(data.name);
    //刷新组件列表
    freshComponentItem();
}

//刷新组件列表
function freshComponentItem() {
    //清空原有列表
    $('.componentItem').remove();
    for (var index in data.components) {
        //添加一个item并注册了click监听
        $('#componentList').prepend("<li class='componentItem' onclick='selectComponent(" + index + ")'><a>" + data.components[index].name + "</a></li>");
    }
}

//点击事件：选择部件
function selectComponent(index) {
    componentIndex = index;
    $('#componentTitle').text(data.components[componentIndex].name);
    $('#delComponent').show();
    $('#textureManagerment').show();
    $('#upload').removeClass("disabled");
    //加载模型列表
    freshModelList();
    //刷新贴图列表
    freshTextureList();
    //刷新贴图选择列表
    freshTextureField();
}

//刷新模型的选择列表
function freshModelList() {
    $('.list-group-item').remove();
    if (data.components[componentIndex].models.length == 0) {
        data.components[componentIndex].modelIndex == -1;
        $('#modelList').append('<a class="list-group-item">暂无模型</a>')
    } else {
        var textureIndex = data.components[componentIndex].textureIndex;
        changeTexture(textureIndex);
        for (var index in data.components[componentIndex].models) {
            if (index == data.components[componentIndex].modelIndex) {
                data.components[componentIndex].models[index].modelObj.visible = true;
                $('#modelList').append("<a class='list-group-item active' ondblclick='changeModelName(" + index + ")' onclick='selectModel(" + index + ")'><span>" + data.components[componentIndex].models[index].name + "</span><button type='button' class='close' onclick='delModelItem(" + index + ")'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button></a>");
            } else {
                data.components[componentIndex].models[index].modelObj.visible = false;
                $('#modelList').append("<a class='list-group-item' ondblclick='changeModelName(" + index + ")' onclick='selectModel(" + index + ")'><span>" + data.components[componentIndex].models[index].name + "</span><button type='button' class='close' onclick='delModelItem(" + index + ")'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button></a>");
            }
        }
    }
}

//点击事件：选择模型
function selectModel(index) {
    data.components[componentIndex].modelIndex = index;
    //将当期贴图赋予给模型
    freshModelList();
}

//点击事件：删除模型
function delModelItem(index) {
    scene.remove(data.components[componentIndex].models[index].modelObj);
    data.components[componentIndex].models.splice(index, 1);
    selectModel(0);
    //阻止事件冒泡
    event.stopPropagation();
}

//点击事件：修改模型名称
function changeModelName(index) {
    $('#modelName').val(data.components[componentIndex].models[index].name);
    $('#changeModelNameModal').modal('show');
    $('#changeModelName').unbind('click');
    $('#changeModelName').click(function () {
        if ($('#modelName').val().trim().length > 0) {
            data.components[componentIndex].models[index].name = $('#modelName').val();
            $('#changeModelNameModal').modal('hide');
            freshModelList();
        }
    });
}

//刷新贴图列表
function freshTextureList() {
    $('#textureList').empty();
    for (var index in data.components[componentIndex].textures) {
        var fileName = data.components[componentIndex].textures[index].name;
        var fileId = data.components[componentIndex].textures[index].fileId;
        $('#textureList').append("<img src='/files/thumbnail/" + fileId + "' width='40px' height='40px' class='img-thumbnail' alt = '" + fileName + "' onclick='delTexture(" + index + ")'> ");
    }
}

//刷新贴图选择的列表
function freshTextureField() {
    $('#textureField').empty();
    for (var index in data.components[componentIndex].textures) {
        var fileName = data.components[componentIndex].textures[index].name;
        var fileId = data.components[componentIndex].textures[index].fileId;
        $('#textureField').append("<img src='/files/thumbnail/" + fileId + "' width='40px' height='40px' class='img-thumbnail' alt = '" + fileName + "' onclick='changeTexture(" + index + ")'> ");
    }
}

function delTexture(index) {
    data.components[componentIndex].textures.splice(index, 1);
    if (data.components[componentIndex].textures.length > 0) {
        data.components[componentIndex].textureIndex = 0;
    } else {
        data.components[componentIndex].textureIndex = -1;
    }
    var textureIndex = data.components[componentIndex].textureIndex;
    changeTexture(textureIndex);
    freshTextureList();
    freshTextureField();
}

//点击事件：切换贴图
function changeTexture(index) {
    if (index < 0)
        return;
    var modelIndex = data.components[componentIndex].modelIndex;
    if (modelIndex < 0)
        return;
    data.components[componentIndex].textureIndex = index;
    replaceTexture(data.components[componentIndex].models[modelIndex].modelObj, data.components[componentIndex].textures[index].textureObj);
}

//---------------------------------------------------------------------------------------------------------------------
//ui初始化结束后
//初始化Threejs
//主要是场景、相机、渲染器
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

//---------------------------------------------------------------------------------------------------------------------

//初始化模型
function loadModel() {
    var manager = new THREE.LoadingManager();
    //加载进度条
    // manager.onStart = function (url, itemsLoaded, itemsTotal) {
    //     console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    // };
    // manager.onLoad = function () {
    // };
    // manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    //     console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    // };
    // manager.onError = function (url) {
    //     console.log('There was an error loading ' + url);
    // };

    //模型加载
    var loader = new THREE.FBXLoader(manager);

    for (var comIndex in data.components) {
        var comLast = (comIndex == data.components.length - 1);
        for (var molIndex in data.components[comIndex].models) {
            var molLast = (molIndex == data.components[comIndex].models.length - 1);
            res = comLast && molLast;
            //异步加载问题
            (function (comIndex, molIndex, res) {
                var url = '/files/model/' + data.components[comIndex].models[molIndex].fileId;
                loader.load(url, function (object) {
                    object.visible = (data.components[comIndex].modelIndex == molIndex);
                    data.components[comIndex].models[molIndex].modelObj = object;
                    scene.add(object);
                    //如果模型全部加载完成
                    if (res)
                        initTexture();
                }
                );
            })(comIndex, molIndex, res);
        }
    }

    //贴图加载
    var loader = new THREE.TextureLoader(manager);
    for (var comIndex in data.components) {
        var comLast = (comIndex == data.components.length - 1);
        for (var textureIndex in data.components[comIndex].textures) {
            var textureLast = (textureIndex == (data.components[comIndex].textures.length - 1));
            var res = comLast && textureLast;
            //异步加载问题
            (function (comIndex, textureIndex, res) {
                var url = '/files/texture/' + data.components[comIndex].textures[textureIndex].fileId;
                loader.load(url, function (object) {
                    data.components[comIndex].textures[textureIndex].textureObj = object;
                    if (res)
                        initTexture();
                }
                );
            })(comIndex, textureIndex, res);
        }
    }
}

function initTexture() {
    totalFinish++;
    if (totalFinish == 2) {
        for (var comIndex in data.components) {
            var modelIndex = data.components[comIndex].modelIndex;
            var textureIndex = data.components[comIndex].textureIndex;
            //赋贴图
            if (modelIndex >= 0 && textureIndex >= 0)
                replaceTexture(data.components[comIndex].models[modelIndex].modelObj, data.components[comIndex].textures[textureIndex].textureObj);
        }
    }
}
//---------------------------------------------------------------------------------------------------------------------
//初始化所有事件
function initEvent() {
    $('#saveScheme').click(function () {
        var saveData = data;
        for (var index in saveData.components) {
            for (textureIndex in saveData.components[index].textures) {
                delete saveData.components[index].textures[textureIndex].textureObj;
            }
            for (modelIndex in saveData.components[index].models) {
                delete saveData.components[index].models[modelIndex].modelObj;
            }
        }
        var image = new Image();
        let imgData = renderer.domElement.toDataURL("image/jpeg");//这里可以选择png格式jpeg格式
        saveData.img = imgData;
        console.info(saveData);
        $.ajax({
            type: "POST",
            url: "/saveScheme",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(saveData)
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

    $("#textureUpload").click(function () {
        $("#textureFile").click();
    });

    //只要file发生改变就上传文件
    $("#file").change(function () {
        if ($(this).val().length > 0) {
            var formData = new FormData($('#uploadForm')[0]);
            $.ajax({
                type: 'post',
                url: "/upload/model",
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
                    addModel('/files/model/' + fileData.filename, addModelItem);
                },
                error: function () {
                    alert("上传失败")
                }
            });
        }
    });

    //贴图文件上传
    $("#textureFile").change(function () {
        if ($(this).val().length > 0) {
            var formData = new FormData($('#uploadTextureForm')[0]);
            $.ajax({
                type: 'post',
                url: "/upload/texture",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                success: function (fileData) {
                    //上传成功后加载模型
                    //加载是异步的
                    var addTextureItem = function (textureObj) {
                        data.components[componentIndex].textures.push({
                            name: fileData.originalname,
                            fileId: fileData.filename,
                            textureObj: textureObj
                        });
                        //selectModel(data.components[componentIndex].models.length - 1);
                        freshTextureList();
                        freshTextureField();
                    }
                    addTexture('/files/texture/' + fileData.filename, addTextureItem);
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
        new $.zui.Messager('你确定要删除该部件吗，该部件的所有模型和贴图将会被清空！', {
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
                        $('#textureField').empty();
                        //TODO 还需要发送ajax清空模型文件
                    }
                }
            }, {
                icon: 'times',
                text: '取消',
            }]
        }).show();
    });

    //贴图模态框弹出
    $('#textureManagerment').click(function () {
        $('#textureManagermentModal').modal('show');
    });
}

// 选择上传完成后加载模型
function addModel(url, callBack) {
    //加载fbx模型
    var loader = new THREE.FBXLoader();
    loader.load(url, function (object) {
        scene.add(object);
        callBack(object);
    }, function (xhr) {
        //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (err) {
        console.error('An error happened');
    }
    );
}
//加载贴图
function addTexture(url, callBack) {
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, function (object) {
        callBack(object);
    });
}
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