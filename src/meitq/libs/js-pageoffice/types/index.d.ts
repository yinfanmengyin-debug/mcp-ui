interface IPOBrowser {
  /**
   * [isClientInstalled](https://www.zhuozhengsoft.com/help/js6/POBrowser/%E6%96%B9%E6%B3%95/isClientInstalled.html)
   * 方法用于判断用户的电脑系统中是否安装了PageOffice客户端程序。
   *
   * ### 语法
   * ```js
   * let value = POBrowser.isClientInstalled();
   * ```
   *
   * @example
   * ```js
   * if (POBrowser.isClientInstalled()) {
   *     console.log('PageOffice客户端已安装');
   * } else {
   *     console.log('PageOffice客户端未安装');
   * }
   * ```
   */
  isClientInstalled(): boolean

  /**
   * [openWindow](https://www.zhuozhengsoft.com/help/js6/POBrowser/%E6%96%B9%E6%B3%95/openWindow.html)
   * 使用非模态的POBrowser窗口打开文档。成熟完美的新式文件打开方式“POBrowser 方式”，此方式彻底永久性的解决了当前及将来各品牌浏览器（谷歌Chrome、Firefox等）可能出现的不加载PageOffice、各种Crash或不稳定问题
   *
   * > openWindowModeless与openWindow的功能是完全相同的，由于前者的名字过长，不利于书写，所以采用后者来替代。
   *
   * ### 语法
   * ```js
   * POBrowser.openWindow(url, features, argument);
   * ```
   *
   * 补充说明窗口特征Features常用属性 ：
   * | 参数          | 描述                                                          |
   * |-------------|-------------------------------------------------------------|
   * | left        | POBrowser窗口的x坐标。以像素计                                        |
   * | top         | POBrowser窗口的y坐标。以像素计                                        |
   * | width       | POBrowser窗口的宽度。以像素计                                         |
   * | height      | POBrowser窗口的高度。以像素计                                         |
   * | frame       | 是否显示POBrowser窗口的边框。默认值为yes                                  |
   * | resizable   | 是否可调节窗口的尺寸。默认是yes                                           |
   * | fullscreen  | 是否全屏显示POBrowser窗口。默认是no                                     |
   * | showloading | 是否显示POBrowser自带的loading图标。默认是yes。PageOffice V6.5及之后版本支持此参数。 |
   *
   * @example
   * ```js
   * <!-- POBrowser窗口的宽度为1050px，高度为900px -->
   * <a href="javascript:POBrowser.openWindow('SimpleWord/Word.jsp?id=1', 'width=1050px;height=900px;','123');">打开文件</a>
   * ```
   *
   * @param url 这是一个集成了PageOffice实现在线打开文档的页面URL。如果是前后端分离项目，此URL的地址一定是前端的地址。
   * @param features 用来描述POBrowser的外观等信息，可以使用Features常用属性的一个或几个，用分号“;”隔开。
   * @param argument 用来向打开的POBrowser窗口递参数。(可以支持超过1KB长参数。)
   */
  openWindow(url: string, features?: string, argument?: string): void

  /**
   *
   * @deprecated 此方法名已废弃，改名为openWindow
   * @see openWindow
   *
   * @param url
   * @param features
   * @param argument
   */
  openWindowModeless(url: string, features?: string, argument?: string): void

  /**
   * [setHeader](https://www.zhuozhengsoft.com/help/js6/POBrowser/%E6%96%B9%E6%B3%95/setHeader.html)
   * 用来支持前后端分离项目的token验证机制，支持多token。向PageOffice后端请求设置header，支持多次调用setHeader()设置更多的值，具体属性名称和属性值以您实际开发为准。
   *
   * ### 语法
   * ```js
   * POBrowser.setHeader(key, value);
   * ```
   * @example
   * ```js
   * import axios from "axios";
   * import { POBrowser } from "js-pageoffice";
   *
   * const service = axios.create({
   *  baseURL: "/dev-api",
   *  timeout: 5000,
   * });
   * // 请求拦截器
   * service.interceptors.request.use(
   *   (config) => {
   *     //const token = Cookies.get('token'); // 假设你的token存储在cookie中
   *     const token = "123";
   *     if (token) {
   *       config.headers["Authorization"] = "Bearer " + token;
   *       POBrowser.setProxyBaseAPI("/dev-api");
   *       // 向PageOffice后端请求设置header，支持多次调用setHeader()设置更多的值，具体属性名称和属性值以您实际开发为准。
   *       POBrowser.setHeader("Authorization", "Bearer " + token);
   *     }
   *
   *     return config;
   *   },
   *   (error) => {
   *     return Promise.reject(error);
   *   }
   * );
   * ```
   *
   * @param key 属性名称
   * @param value 属性值
   */
  setHeader(key: string, value: string | number | boolean): void

  /**
   * [setProxyBaseAPI](https://www.zhuozhengsoft.com/help/js6/POBrowser/%E6%96%B9%E6%B3%95/setProxyBaseAPI.html)
   * 设置后端代理的基础Url，具体属性值以您实际开发为准。
   *
   * ### 语法
   * ```js
   * POBrowser.setProxyBaseAPI(baseUrl);
   * ```
   *
   * @example
   * ```js
   * import axios from "axios";
   * import { POBrowser } from "js-pageoffice";
   *
   * const service = axios.create({
   *  baseURL: "/dev-api",
   *  timeout: 5000,
   * });
   * // 请求拦截器
   * service.interceptors.request.use(
   *   (config) => {
   *     //const token = Cookies.get('token');
   *     const token = "123";
   *     if (token) {
   *       config.headers["Authorization"] = "Bearer " + token;
   *       // 设置后端代理,具体属性值以您实际开发为准,比如POBrowser.setProxyBaseAPI(process.env.VUE_APP_BASE_API);
   *       POBrowser.setProxyBaseAPI("/dev-api");
   *       POBrowser.setHeader("Authorization", "Bearer " + token);
   *     }
   *
   *     return config;
   *   },
   *   (error) => {
   *     return Promise.reject(error);
   *   }
   * );
   * ```
   *
   * @param baseUrl 基础Url
   */
  setProxyBaseAPI(baseUrl: string): void

  /**
   * [setStorage](https://www.zhuozhengsoft.com/help/js6/POBrowser/%E6%96%B9%E6%B3%95/setStorage.html)
   * 用来支持前后端分离项目的token验证机制，支持多token。如果令牌(token)是保存在LocalStorage或SessionStorage中，您必须调用POBrowser.setStorage()方法。
   *
   * ### 语法
   * ```js
   * POBrowser.setStorage(key, value);
   * ```
   *
   * @example
   * ```js
   * import axios from "axios";
   * import { POBrowser } from "js-pageoffice";
   *
   * const service = axios.create({
   *  baseURL: "/dev-api",
   *  timeout: 5000,
   * });
   * // 请求拦截器
   * service.interceptors.request.use(
   *   (config) => {
   *     //const token = Cookies.get('token');
   *     const token = "123";
   *     if (token) {
   *       config.headers["Authorization"] = "Bearer " + token;
   *       POBrowser.setProxyBaseAPI("/dev-api");
   *       POBrowser.setHeader("Authorization", "Bearer " + token);
   *        // 前端存储token的方案
   *        // 如果令牌(token)是保存在LocalStorage或SessionStorage中，您必须调用POBrowser.setStorage()方法。
   *        POBrowser.setStorage("Admin-Token",getToken());//支持多次调用setStorage()设置更多的值，具体属性名称和属性值以您实际开发为准。
   *     }
   *
   *     return config;
   *   },
   *   (error) => {
   *     return Promise.reject(error);
   *   }
   * );
   * ```
   *
   * @param key 属性名称
   * @param value 属性值
   */
  setStorage(key: string, value: string | number | boolean): void
}

interface PageOfficeCtrl {
  /**
   * [Caption](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/Caption.html)
   * 属性设置PageOffice客户端控件的标题文字。
   *
   * ### 语法
   * ```js
   * pageofficectrl.Caption = "我的标题";//设置Caption的值
   * ```
   * > 属性Caption设置的是Pageoffice客户端控件的标题栏文字，而非整个页面的Title值。
   */
  Caption: string

  /**
   * [ClientOS](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/ClientOS.html)
   * 属性获取当前客户端电脑的操作系统类型，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * var osInfo = pageofficectrl.ClientOS;
   * ```
   *
   * > 此功能主要是用于获取客户端电脑属于Windows平台还是Linux平台。
   */
  readonly ClientOS: string

  /**
   * [ClientCertName](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/ClientCertName.html)
   * 当web项目使用https双向SSL证书时，需要使用此属性设置客户端证书名称。仅适用于Windows客户端的情况。
   *
   * ### 语法
   * ```js
   * pageofficectrl.ClientCertName = "clientCertName";// 客户端证书的名称
   * ```
   * @example
   * ```js
   * function OnPageOfficeCtrlInit() {
   *     pageofficectrl.ClientCertName = "client";
   * }
   * ```
   */
  ClientCertName: string

  /**
   * [CustomSaveResult](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/CustomSaveResult.html)
   * 属性返回文档保存的结果，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * var strCustomSaveResult = pageofficectrl.CustomSaveResult;
   * ```
   *
   * > 1、当用户执行完保存操作后，如果开发者想弹出自己定义的提示框提示是否保存成功，则可以通过该属性的返回值来判断。具体使用方法，请参考服务器端的开发帮助中的FileSaver.CustomSaveResult属性的使用方法。
   * >
   * > 2、此功能多用于返回保存操作的执行结果、错误原因，或返回一些用户需要的自定义参数，如某条记录的ID、用户名等信息。如果是SaveFilePage和SaveDataPage都返回了CustomSaveResult的自定义结果，那么用pageofficectrl.CustomSaveResult获取到的这两个结果会用换行符\n分隔。
   */
  readonly CustomSaveResult: string

  /**
   * [CustomToolbar](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/CustomToolbar.html)
   * 属性可设置是否显示用户自定义工具栏，布尔类型，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.CustomToolbar = true|false;//false：不显示;true：显示
   * ```
   *
   * > 默认值为true。用户可自定义js函数来控制是否显示用户自定义工具栏。
   */
  CustomToolbar: boolean

  /**
   * [DisableOpen](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DisableOpen.html)
   * 属性设置是否允许用户使用Ctrl+o快捷键或工具栏中“打开”按钮导入本地文件的操作，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.DisableOpen = true|false;
   * ```
   *
   * > 默认值：true：禁止打开本地文件的操作。false：允许打开本地文件的操作。
   */
  DisableOpen: boolean

  /**
   * [DisablePrint](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DisablePrint.html)
   * 属性设置当前文件是否允许执行“打印”操作，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.DisablePrint = true|false;
   * ```
   *
   * > 默认值：false，允许打印。true：禁止打印。
   */
  DisablePrint: boolean

  /**
   * [DisableSave](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DisableSave.html)
   *
   * 属性设置当前文件是否允许执行保存操作，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.DisableSave = true|false;
   * ```
   *
   * > 默认值：true：禁止保存。false，允许保存。
   */
  DisableSave: boolean

  /**
   * [DisableSaveAs](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DisableSaveAs.html)
   * 属性设置当前文件是否允许执行“另存为”操作，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.DisableSaveAs = true|false;
   * ```
   *
   * > 默认值：false，允许另存为。true：禁止另存为。
   */
  DisableSaveAs: boolean

  /**
   * [DocumentFileName](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DocumentFileName.html)
   * 属性返回当前Office文档的文件名称，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * var strValue = pageofficectrl.DocumentFileName;
   * ```
   *
   * > 返回当前Office文档的文件名称。
   */
  readonly DocumentFileName: string

  /**
   * [DocumentText](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/DocumentText.html)
   * 属性返回返回当前Word文档的纯文本内容，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * var strValue = pageofficectrl.DocumentText;
   * ```
   * 返回当前Word文档的纯文本内容。
   */
  readonly DocumentText: string

  /**
   * [Enabled](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/Enabled.html)
   * 属性设置客户端PageOffice控件是否显示在最上层遮挡其他Html元素，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.Enabled = true|false;
   * ```
   *
   * > 默认值：true：设置客户端PageOffice控件显示在所有Html元素上方，遮挡其他Html元素。false：设置客户端PageOffice控件不要显示在最上层。
   */
  Enabled: boolean

  /**
   * [FullScreen](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/FullScreen.html)
   * 属性设置控件窗口是否全屏显示，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.FullScreen = true|false;
   * ```
   *
   * > 默认值为false：普通嵌入窗口大小；true：全屏
   */
  FullScreen: boolean

  /**
   * [IsDirty](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/IsDirty.html)
   * 属性用于判断文档在打开后或最后一次保存后是否修改过（仅支持Word文档）。
   *
   * ### 语法
   * ```js
   * let value = pageofficectrl.IsDirty;
   * ```
   *
   * @example
   * 如果开发人员希望屏蔽PageOffice的自动判断功能，改用自己的程序判断文档是否修改，那么需要在POBrowser的关闭事件函数`OnBeforeBrowserClosed`中结合使用`IsDirty`属性来实现。具体代码如下：
   * ```js
   * function OnBeforeBrowserClosed(){
   *     //实现自定义的弹出文件保存提示
   *     if(pageofficectrl.IsDirty){
   *         if(confirm('文档尚未保存，确认关闭吗？')){
   *             pageofficectrl.CloseWindow(true);//必须使用true参数。
   *         }else{
   *             return;
   *         }
   *     }
   *
   *     pageofficectrl.CloseWindow(true);//必须。否则窗口不会关闭。
   * }
   * ```
   */
  IsDirty: boolean

  /**
   * [OfficeToolbars](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/OfficeToolbars.html)
   * 属性可设置是否显示Office工具栏，布尔类型，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.OfficeToolbars = true|false;//false：不显示;true：显示
   * ```
   *
   * > 默认值为true。 用户可自定义js函数来控制是否显示office工具栏。
   */
  OfficeToolbars: boolean

  /**
   * [SaveAsReadOnly](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/SaveAsReadOnly.html)
   * 属性设置客户端另存到本地的文件是否可以编辑，布尔类型，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.SaveAsReadOnly = true|false;
   * ```
   *
   * > 默认值：false。 只读模式打开文件以后，如果设置此属性为true，调用`pageofficectrl.ShowDialog(3)`另存到本地的文件就是只读的，反之就是可以编辑的。
   */
  SaveAsReadOnly: boolean

  /**
   * [SaveDataPage](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/SaveDataPage.html)
   * 设置 PageOffice 控件的数据保存后端地址。此属性是 PageOfficeCtrl 控件的重要属性。SaveDataPage指向的后端地址用来接收 PageOfficeCtrl 控件提交的用户输入数据。当 PageOfficeCtrl 控件保存文档的时候，PageOfficeCtrl 控件就会提交Word文档中数据区域的值或Excel文件中单元格的值到SaveFilePage指定的后端地址。
   *
   * ### 语法
   * ```js
   * pageofficectrl.SaveDataPage = '后端API方法地址';
   * ```
   */
  SaveDataPage: string

  /**
   * [SaveFilePage](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/SaveFilePage.html)
   * 设置 PageOffice 控件的文档保存的后端地址。此属性是 PageOfficeCtrl 控件的重要属性。SaveFilePage指向的后端地址用来接收 PageOfficeCtrl 控件提交的文档。当 PageOfficeCtrl 控件保存文档的时候，PageOfficeCtrl 控件就会提交文档的二进制流到SaveFilePage指定的后端地址。
   *
   * ### 语法
   * ```js
   * pageofficectrl.SaveFilePage = '后端API方法地址';
   * ```
   */
  SaveFilePage: string

  /**
   * [ShowRevisions](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/ShowRevisions.html)
   * 属性设置当前Word文档是否显示用户的修改痕迹，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.ShowRevisions = true|false;
   * ```
   *
   * > 默认值：true，显示用户修改痕迹。false：隐藏用户修改痕迹。
   */
  ShowRevisions: boolean

  /**
   * [Titlebar](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/Titlebar.html)
   * 属性可设置是否显示标题栏，布尔类型，可读写。
   *
   * ### 语法
   * ```js
   * pageofficectrl.Titlebar = true|false;//false：不显示;true：显示
   * ```
   *
   * > 默认值为true。 用户可自定义js函数来控制是否显示标题栏。
   */
  Titlebar: boolean

  /**
   * [WindowParams](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/WindowParams.html)
   * 属性获取父页面中POBrowser.openWindow()方法的第三个参数的值，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * let value = pageofficectrl.WindowParams;
   * ```
   *
   * @example
   * 1.调用openWindow的页面（父页面）传递参数。
   * ```js
   * let paramJson={};
   * paramJson.file_id=1;
   * paramJson.file_name="test.doc";
   * let paramString=JSON.stringify(paramJson);
   *
   * //openWindow()第三个参数用来向弹出的PageOffice浏览器（POBrowser）窗口传递参数(参数长度不限)，支持json字符串。
   * //此处为了方便演示，我们传递了file_id和file_name两个参数，具体以您实际开发为准。
   * POBrowser.openWindow('SimpleWord/Word', 'width=1050px;height=900px;',paramString);
   * ```
   *
   * 2.弹出的PageOffice浏览器（POBrowser）窗口使用pageofficectrl.WindowParams获取参数。
   * ```js
   * //使用pageofficectrl.WindowParams获取获取父页面中POBrowser.openWindow()方法的第三个参数的值，为字符串类型
   * let paramStr = pageofficectrl.WindowParams;
   * alert(paramStr);
   * ```
   */
  readonly WindowParams: string

  readonly excel: PageOfficeCtrlExcel

  readonly word: PageOfficeCtrlWord

  readonly zoomseal: PageOfficeCtrlZoomSeal

  /**
   * [AcceptAllRevisions](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/AcceptAllRevisions.html)
   * 接受当前word文档的所有修订痕迹。
   *
   * ### 语法
   * ```js
   * pageofficectrl.AcceptAllRevisions();
   * ```
   *
   * > **Note**
   * >
   * > 使用AcceptAllRevisions方法，打开文档时WebOpen函数的OpenModeType参数必须为“docAdmin”，即核稿模式打开文件。
   *
   * > **Tips**
   * >
   * > 与强制痕迹保留功能相关的内容如下：
   * >
   * > 打开文档时，WebOpen函数的OpenModeType参数设为“docRevisionOnly”，即进入强制痕迹保留功能；OpenModeType参数设为“docAdmin”，即进入清稿或定稿功能。
   * >
   * > 使用属性ShowRevisions控制是否显示痕迹。
   * >
   * > 使用AcceptAllRevisions()可一次性接受所有痕迹。用户也可使用鼠标右键或工具栏逐个处理痕迹。
   *
   */
  AcceptAllRevisions(): void

  /**
   * [AddCustomToolButton](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/AddCustomToolButton.html)
   * 给自定义工具栏添加自定义按钮。
   *
   * ### 语法
   * ```js
   * pageofficectrl.AddCustomToolButton(caption, jsFunction , iconIndex);
   * ```
   * **PageOffice内置图标索引如下：**
   *
   * ![内置图标索引](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/CustomToolbuttonIcons.png)
   *
   * @example
   * ```js
   *  pageofficectrl.AddCustomToolButton("保存", "SaveDocument()", 1);
   *  pageofficectrl.AddCustomToolButton("打印", "ShowPrintDlg()", 6);
   *  pageofficectrl.AddCustomToolButton("全屏切换", "SwitchFullScreen()", 4);
   *  ```
   *
   * @param caption 字符串类型。按钮的标题。如果 caption 定义为 "-"，表示此按钮是分隔线。
   * @param jsFunction 字符串类型。JavaScript 函数的名字。当用户点击当前按钮时触发此 JavaScript 函数。
   * @param iconIndex int类型。按钮图标的索引。PageOffice内置了若干图标，您可以选择使用其中的图标。默认值是 0。
   */
  AddCustomToolButton(caption: string, jsFunction: string, iconIndex: number): void

  /**
   * [CloseWindow](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/CloseWindow.html)
   * 方法用来关闭POBrowser浏览器窗口。
   *
   * ### 语法
   * ```js
   * pageofficectrl.CloseWindow(bForce);
   * ```
   *
   * @param bForce 布尔类型，是否强制关闭窗口。默认值false：不强制关闭窗口，会触发OnBeforeBrowserClosed事件。true：会强制关闭窗口，不会触发OnBeforeBrowserClosed事件。
   */
  CloseWindow(bForce?: boolean): void

  /**
   * [ExcelImportDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ExcelImportDialog.html)
   * 显示导入Excel文件的对话框。
   *
   * ### 语法
   * ```js
   * pageofficectrl.ExcelImportDialog();
   * ```
   * > 显示导入Excel文件的对话框向导。若在后台代码中设置了打开的Excel文件的版本，则对话框中只显示该版本的Excel文件；若未设置版本，则显示所有版本的Excel文件。
   *
   */
  ExcelImportDialog(): void

  /**
   * [PrintOut](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/PrintOut.html)
   * 打印当前文档。
   *
   * ### 语法
   * ```js
   * pageofficectrl.PrintOut(PromptUser, PrinterName, Copies, FromPage, ToPage);
   * ```
   *
   * @example
   * ```js
   * //调用客户端本地默认的打印机，打印一份，不显示打印对话框，批量打印时常用此写法
   * pageofficectrl.PrintOut();
   * //调用客户端本地默认的打印机，不显示打印对话框，打印一份，从第一页开始，第二页结束
   * pageofficectrl.PrintOut(false,"",1,1,2);
   * ```
   *
   * @param promptUser 布尔类型，可选参数，默认false；true表示显示打印对话框。
   * @param printerName 字符串类型，打印机的名称。
   * @param copies 整数类型，可选参数，默认1份。设置打印的份数。
   * @param formPage 整数类型，可选参数，默认0；设置打印从几页开始。
   * @param toPage 整数类型，可选参数，默认0；设置打印至第几页结束。
   */
  PrintOut(promptUser?: boolean, printerName?: string, copies?: number, formPage?: number, toPage?: number): void

  /**
   * [PrintPreview](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/PrintPreview.html)
   * 显示打印预览视图，进入打印预览状态。
   *
   * ### 语法
   * ```js
   * pageofficectrl.PrintPreview();
   * ```
   * > **注意**
   * >
   * > 当文档处于打印预览状态时，请不要调用控件的其他方法或属性，以免引起视图状态的冲突。
   */
  PrintPreview(): void

  /**
   * [ProtectDoc](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ProtectDoc.html)
   * 保护当前文档。
   *
   * ### 语法
   * ```js
   * pageofficectrl.ProtectDoc();
   * ```
   * > 保护文档，就是调用Office自身的限制编辑接口实现的，只不过使用的是随机密码对文档做的保护。
   */
  ProtectDoc(): void

  /**
   * [Reload](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/Reload.html)
   * 重新加载PageOffice客户端控件。一般来说，此方法用于前后端分离项目，比如Vue项目中套红时，点击套红按钮重新请求后台Controller方法后，控件显示空白不加载时就需要调用此方法重新加载控件。
   *
   * ### 语法
   * ```js
   * pageofficectrl.Reload();
   * ```
   */
  Reload(): void

  /**
   * [RunMacro](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/RunMacro.html)
   * 在线打开的PageOffice文档中执行已录制的宏指令或者新编写的宏指令（VBA代码）。仅限Windows客户端。
   *
   * ### 语法
   * ```js
   * pageofficectrl.RunMacro( MacroName, MacroScript );//运行文档中的无返回值的宏命令.
   * let strValue = pageofficectrl.RunMacro( MacroName,MacroScript);//运行有返回值的宏命令.
   * ```
   * 缺省MacroScript参数时，在客户端调用时，会根据宏指令名称执行打开的文档中已录制或存在的宏指令；如果传递该参数，就直接执行该参数中的宏指令。这里的宏指令指的是完整的VBA函数字符串，必须包含函数的开始和结束，并且函数的名字要和MacroName参数指定的函数名字完全相同。
   *
   * > 当参数MacroScript中有多句宏指令代码时，请把每句代码单独放一行（VBA的要求），注意回车换行。
   *
   * @example
   * 执行有返回值宏命令。例如，在页面上放一个普通的按钮“Button”，给其添加一个“onclick”事件，命名为“TestRunMacro”，点击按钮执行Js函数TestRunMacro()，​ JS代码如下：​
   * ```js
   * function TestRunMacro(){
   *     var value = pageofficectrl.RunMacro("myFunc1", 'Function myFunc1() \r\n    myFunc1 = "123" \r\n  End Function');
   *     alert(value);
   * }
   * ```
   *
   * @param macroName 字符串类型，表示宏指令名称。如："myfunc"
   * @param macroScript 字符串类型，表示要执行的宏指令代码，可选。
   * @constructor
   */
  RunMacro(macroName: string, macroScript?: string): string | undefined

  /**
   * [ShowDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ShowDialog.html)
   * 显示对话框；参数为对话框类型。
   *
   * ### 语法
   * ```js
   * pageofficectrl.ShowDialog( DlgType );
   * ```
   *
   * > DlgType 取值：
   * >
   * > 1:打开 2:保存 3:另存为 4:打印 5:打印设置 6:文件属性
   *
   * @param dlgType 参数为对话框类型，取值为1,2,3,4,5,6。
   * @constructor
   */
  ShowDialog(dlgType: 1 | 2 | 3 | 4 | 5 | 6): void

  /**
   * [ShowHtmlModalDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ShowHtmlModalDialog.html)
   * 显示一个HTML内容的模态对话框.
   *
   * ### 语法
   * ```js
   * pageofficectrl.ShowHtmlModalDialog(URL, Arguments, Features);
   * ```
   * @example
   * ```js
   * pageofficectrl.ShowHtmlModalDialog("Dlg.htm", "parameter=xx", "left=300px;top=390px;width=520px;height=410px;");
   * ```
   * @param url 必选参数，字符串类型，用来指定对话框要显示的页面的URL.
   * @param arguments 可选参数，字符串类型。用来向对话框传递参数。
   * @param features 可选参数，字符串类型。用来描述对话框的外观等信息，可以使用以下的一个或几个，用分号“;”隔开.
   */
  ShowHtmlModalDialog(url: string, arguments?: string, features?: string): void

  /**
   * [ShowHtmlModelessDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ShowHtmlModelessDialog.html)
   * 显示一个HTML内容的非模态对话框.
   *
   * ### 语法
   * ```js
   * pageofficectrl.ShowHtmlModelessDialog(URL, Arguments, Features);
   * ```
   *
   * @example
   * 通过点击页面的一个按钮弹出一个添加数据区域的非模态对话框：如，在页面上放一个普通的按钮“Button”，给它添加一个“onclick”事件，命名为“ShowDefineDataRegions”,点击按钮后，执行Js函数ShowDefineDataRegions().
   * ```js
   * function ShowDefineDataRegions(){
   *     pageofficectrl.ShowHtmlModelessDialog("DataRegionDlg.htm", "parameter=xx", "left=300px;top=390px;width=520px;height=410px;");
   * }
   * ```
   *
   * @param url 必选参数，字符串类型，用来指定对话框要显示的页面的URL.
   * @param arguments 可选参数，字符串类型。用来向对话框传递参数。
   * @param features 可选参数，字符串类型。用来描述对话框的外观等信息，可以使用以下的一个或几个，用分号“;”隔开.
   */
  ShowHtmlModelessDialog(url: string, arguments?: string, features?: string): void

  /**
   * [ShowOfficeDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/ShowOfficeDialog.html)
   * 调用Office接口，弹出显示word自己的对话框。index 取值范围见网页文档
   *
   * ### 语法
   * ```js
   * pageofficectrl.ShowOfficeDialog(index);
   * ```
   *
   * @param index 整数类型。Word软件的对话框的序号。
   */
  ShowOfficeDialog(index: number): void

  /**
   * [UnProtectDoc](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/UnProtectDoc.html)
   * 取消对当前文档的保护。
   *
   * ### 语法
   * ```js
   * pageofficectrl.UnProtectDoc();
   * ```
   */
  UnProtectDoc(): void

  /**
   * [WebSave](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WebSave.html)
   * 保存当前文档到服务器。
   *
   * ### 语法
   * ```js
   * pageofficectrl.WebSave();
   * ```
   * > 这是PageOffice非常重要的客户端函数，自定义工具栏保存按钮保存文档时需要调用本函数。 此方法不是本地文件另存，而是保存到服务器端。
   *
   * @example
   * ```js
   * function saveFile(){
   *     pageofficectrl.WebSave();// 保存到服务器
   *     location.href = "list.aspx";//保存成功后跳转到另一个页面；如不想跳转，此句可省略
   * }
   * ```
   *
   */
  WebSave(): void

  /**
   * [WebSaveAsHTML](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WebSaveAsHTML.html)
   * 将当前文档另存为HTML类型的文件，并上传到Web服务器端。
   *
   * ### 语法
   * ```js
   * pageofficectrl.WebSaveAsHTML();
   * ```
   * > 该方法可将当前Office文档另存为html类型的文件，后缀名为“.htm”，并上传到Web服务器端。
   *
   */
  WebSaveAsHTML(): void

  /**
   * [WebSaveAsImage](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WebSaveAsImage.html)
   * 将当前Word文档的第一页另存为.jpg类型的图片，并上传到Web服务器端。
   *
   * ### 语法
   * ```js
   * pageofficectrl.WebSaveAsImage();
   * ```
   * > 该方法可将当前Word文档的第一页另存为后缀名为“.jpg”类型的图片，并上传到Web服务器端。该图片的大小、高度与Word文档第一页内容的多少有关。
   *
   * @example
   * ```js
   * <script type="text/JavaScript">
   *     function Save(){
   *       pageofficectrl.WebSave();// 保存整个Word文档内容
   *       pageofficectrl.WebSaveAsImage();//将Word文档的第一页内容另存为“.jpg”类型的图片
   *     }
   * </script>
   * ```
   */
  WebSaveAsImage(): void

  /**
   * [WebSaveAsOFD](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WebSaveAsOFD.html)
   * 将当前文档另存为OFD类型的文件，并上传到Web服务器端。 仅限国产版
   *
   * ### 语法
   * ```js
   * pageofficectrl.WebSaveAsOFD();
   * ```
   * > 该方法可将当前Office文档另存为OFD类型的文件，后缀名为“.ofd”，并上传到Web服务器端。
   */
  WebSaveAsOFD(): void

  /**
   * [WebSaveAsPDF](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WebSaveAsPDF.html)
   * 将当前文档另存为PDF类型的文件，并上传到Web服务器端，后缀名为“.pdf”。仅限专业版、企业版
   *
   * ### 语法一
   * ```js
   * pageofficectrl.WebSaveAsPDF();
   * ```
   *
   * ### 语法二
   * ```js
   * pageofficectrl.WebSaveAsPDF(strPDFName, bWithMarkup);
   * ```
   *
   * @example
   * 1. 另存为一个保留word文件中痕迹的PDF文件：
   * ```js
   * pageofficectrl.WebSaveAsPDF(undefined, true);
   * ```
   * 2. 另存为去掉word文件中痕迹的PDF文件：
   * ```js
   * pageofficectrl.WebSaveAsPDF(undefined, false);
   * //等同于
   * pageofficectrl.WebSaveAsPDF();
   * ```
   *
   * @param strPDFName 保存的pdf文件名
   * @param bWithMarkup 布尔类型，是否保留文件中的痕迹。默认值：false ，不保留痕迹。
   */
  WebSaveAsPDF(strPDFName?: string, bWithMarkup?: boolean): void

  /**
   * [WordImportDialog](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E6%96%B9%E6%B3%95/WordImportDialog.html)
   * 显示导入Word文件的对话框。
   *
   * ### 语法
   * ```js
   * pageofficectrl.WordImportDialog();
   * ```
   * > 显示导入Word文件的对话框向导。若在后台代码中设置了打开的Word文件的版本，则对话框中只显示该版本的Word文件；若未设置版本，则显示所有版本的Word文件。
   *
   */
  WordImportDialog(): void
}

interface PageOfficeCtrlExcel {
  /**
   * [GetTextFromSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/GetTextFromSelection.html)
   * 方法用于获取当前Excel文档中所有选中的单元格的文本内容。如果是选中了一个单元格，那么返回值就是一个纯文本的字符串；如果是选中了多个单元格，那么返回值就是一个json数组字符串。
   *
   * ### 语法
   * ```js
   * let value = pageofficectrl.excel.GetTextFromSelection();
   * ```
   *
   * @example
   * ```js
   * let value = pageofficectrl.excel.GetTextFromSelection();//如果，选中了2行3列的一块区域
   * console.log(value); //那么，输出结果如下：[["小米su7", "台", 190000], ["比亚迪秦plus", "台", 150000]]
   * ```
   *
   */
  GetTextFromSelection(): string

  /**
   * [MergeSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/MergeSelection.html)
   * 方法用于合并选中区域的所有单元格。该方法包含一个可选参数 Across，用于控制单元格的合并方式：
   *
   * - 当 `Across` 设置为 `false`（默认值）时，选中区域的所有单元格将被合并为一个单一单元格。
   * - 当 `Across` 设置为 `true` 时，选中区域的每一行会分别执行横向合并，即每行的单元格会被合并为一个独立的单元格。
   *
   * ### 语法
   * ```js
   * pageofficectrl.excel.MergeSelection(Across);
   * ```
   * @example
   * ```js
   * pageofficectrl.excel.MergeSelection(true);//对选中区域的每行的单元格合并为一个独立单元格。
   * ```
   *
   * @param across 布尔类型。默认值：false，将选中区域的所有单元格合并为一个单一单元格；true，对选中区域的每一行分别执行横向合并，即每行的单元格合并为一个独立单元格。
   */
  MergeSelection(across: boolean): void

  /**
   * [SelectRange](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/SelectRange.html)
   * 方法用于选中Excel文件当前工作簿中的指定单元格。可以是选中一个单元格，也可以是选中一块区域。
   *
   * ### 语法
   * ```js
   * pageofficectrl.excel.SelectRange(RangeAddress);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.excel.SelectRange("B2"); // 选中B2单元格
   * pageofficectrl.excel.SelectRange("B4:C5"); // 选中B4到C5的区域
   * ```
   *
   * @param rangeAddress 字符串类型。单元格区域地址。
   */
  SelectRange(rangeAddress: string): void

  /**
   * [SetBackColorToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/SetBackColorToSelection.html)
   * 方法用于设置Excel文件当前工作簿中所有选中的单元格背景色。
   *
   * ### 语法
   * ```js
   * pageofficectrl.excel.SetBackColorToSelection(color);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.excel.SetBackColorToSelection("#ffff00");//设置所有选中的单元格背景为黄色
   * ```
   *
   * @param color 字符串类型。只支持16进制的颜色字符串
   */
  SetBackColorToSelection(color: string): void

  /**
   * [SetForeColorToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/SetForeColorToSelection.html)
   * 方法用于设置Excel文件当前工作簿中所有选中单元格的文字颜色。
   *
   * ### 语法
   * ```js
   * pageofficectrl.excel.SetForeColorToSelection(color);
   * ```
   * @example
   * ```js
   * pageofficectrl.excel.SetForeColorToSelection("#ff0000");//设置所有选中的单元格文字为红色
   * ```
   *
   * @param color  字符串类型。只支持16进制的颜色字符串。
   */
  SetForeColorToSelection(color: string): void

  /**
   * [SetTextToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/excel/%E6%96%B9%E6%B3%95/SetTextToSelection.html)
   * 方法用于给Excel文件当前工作簿中选中的单元格赋值。如果只选中了一个单元格，那就使用普通字符串值；如果选中了一块区域，那么就使用json数组字符串。
   *
   * ### 语法
   * ```js
   * pageofficectrl.excel.SetTextToSelection(strText);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.excel.SetTextToSelection("hello"); // 给一个选中的单元格赋值
   *
   * let testValue = [["张三", "100"], ["李四", "99"]];// 给一个选中了2行2列的区域赋值
   * pageofficectrl.excel.SetTextToSelection(JSON.stringify(testValue));
   * ```
   *
   * @param strText 字符串类型。普通字符串或json数组字符串。
   */
  SetTextToSelection(strText: string): void
}

interface PageOfficeCtrlWord {
  /**
   * [BookmarksAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/BookmarksAsJson.html)
   * 获取当前Word文档中书签的JSON对象。通常用来遍历Word文档中的书签。
   *
   * ### 语法
   * ```js
   * let bookmarksJson = pageofficectrl.word.BookmarksAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"id":0,"name":"Address"},{"id":1,"name":"Telephone"}]
   *
   * @example
   * ```js
   * //遍历书签
   * function getBookMarkList(){
   *     let bookmarksJson = pageofficectrl.word.BookmarksAsJson;
   *     let bookmarksObj = JSON.parse(bookmarksJson);
   *     for(let key in bookmarksObj ){
   *         let bkName = bookmarksObj[key].name;
   *         //根据书签名称选中书签
   *         pageofficectrl.word.SelectBookmark(bookmarksObj[key].name);
   *         let bkValue = pageofficectrl.word.GetTextFromSelection();
   *         alert("书签名称："+bkName+";书签值："+bkValue);
   *     }
   * }
   * ```
   */
  readonly BookmarksAsJson: string

  /**
   * [CharacterCount](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/CharacterCount.html)
   * 属性用于统计和获取Word文档中的字符数。
   *
   * ### 语法
   * ```js
   * let value = pageofficectrl.word.CharacterCount;
   * ```
   */
  readonly CharacterCount: number

  /**
   * [CommentsAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/CommentsAsJson.html)
   * 获取当前Word文档中所有键盘批注内容的JSON对象。通常用来遍历Word文档中的所有键盘批注。
   *
   * ### 语法
   * ```js
   * let commentsJson = pageofficectrl.word.CommentsAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"id":0,"date":45428.575000,"author":"张三"},{"id":1,"date":45428.540972,"author":"李四"},{"id":2,"date":42273.664583,"author":"王五"},{"id":3,"date":42253.672222,"author":"赵六"}]
   *
   * @example
   * ```js
   * //遍历所有键盘批注
   * function commentsList() {
   *         let commentsListJson =JSON.parse(pageofficectrl.word.CommentsAsJson)
   *         for (let item of commentsListJson) {
   *                 let baseDate = new Date(Date.UTC(1899, 11, 30));
   *                 let iDate = new Date(baseDate.getTime() + item.date* 24 * 60 * 60 * 1000 -  8 * 60 * 60 * 1000);
   *                 const pad = (num) => (num < 10 ? '0' + num : num);
   *                 let itemDate = iDate.getFullYear()+'-'+pad(iDate.getMonth() + 1)+'-'+pad(iDate.getDate())+' '+pad(iDate.getHours())+':'+pad(iDate.getMinutes());
   *
   *                 alert( item.id + ":" +itemDate+"[" +item.author+"]:"+ pageofficectrl.word.GetTextFromComment(parseInt(item.id)) );
   *         }
   * }
   * ```
   */
  readonly CommentsAsJson: string

  /**
   * [DataRegionsAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/DataRegionsAsJson.html)
   * 获取当前Word文档中数据区域的JSON对象。通常用来遍历Word文档中的数据区域。
   *
   * ### 语法
   * ```js
   * let dataRegionsJson = pageofficectrl.word.DataRegionsAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"id":0,"name":"PO_deptName"},{"id":1,"name":"PO_userName"}]
   *
   * @example
   * ```
   * //遍历数据区域
   * function getDataRegionList(){
   *         let dataRegionsJson = pageofficectrl.word.DataRegionsAsJson;
   *         let dataRegionsObj = JSON.parse(dataRegionsJson);
   *         for(let key in dataRegionsObj ){
   *                 let drName = dataRegionsObj[key].name;
   *                 //pageofficectrl.word.LocateDataRegion(drName);//定位光标到数据区域
   *                 let drValue =  pageofficectrl.word.GetValueFromDataRegion(drName);
   *                 alert("数据区域："+drName+"; 值："+drValue);
   *         }
   * }
   * ```
   */
  readonly DataRegionsAsJson: string

  /**
   * [DataRegionsDefinedAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/DataRegionsDefinedAsJson.html)
   * 服务器端WordDocument对象中的Template对象定义的所有数据区域。
   *
   * ### 语法
   * ```js
   * let drDefinedAsJson = pageofficectrl.word.DataRegionsDefinedAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"name":"PO_No","caption":"【合同编号】"},{"name":"PO_ProductName","caption":"【产品名称】"},{"name":"PO_Buyer","caption":"【购货单位】"},{"name":"PO_Supplier","caption":"【供货单位】"}]
   */
  readonly DataRegionsDefinedAsJson: string

  /**
   * [DataTagsDefinedAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/DataTagsDefinedAsJson.html)
   * 服务器端WordDocument对象中的Template对象定义的所有数据标签。
   *
   * ### 语法
   * ```js
   * let dtDefinedAsJson = pageofficectrl.word.DataTagsDefinedAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"name":"【 甲方 】"},{"name":"【 乙方 】"},{"name":"【 合同日期 】"},{"name":"【 合同编号 】"}]
   */
  readonly DataTagsDefinedAsJson: string

  /**
   * [DocumentMap](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/DocumentMap.html)
   * 显示或隐藏导航窗格。true：显示文档结构图; false：隐藏文档结构图。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.DocumentMap = true|false;//true：显示文档结构图; false：隐藏文档结构图。
   * ```
   */
  DocumentMap: boolean

  /**
   * [OutlineLevel](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/OutlineLevel.html)
   * 设置当前光标所在段落，或被选中文字的大纲级别。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.OutlineLevel = 1|2|3|4|5|6|7|8|9; //大纲级别
   * ```
   */
  OutlineLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

  /**
   * [PageCount](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/PageCount.html)
   * 获取当前Word文件总页数。
   *
   * ### 语法
   * ```js
   * let pageCount = pageofficectrl.word.PageCount;
   * ```
   */
  readonly PageCount: number

  /**
   * [PageNo](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/PageNo.html)
   * 获取Word文档的当前页是第几页。
   *
   * ### 语法
   * ```js
   * let pageNo = pageofficectrl.word.PageNo;
   * ```
   */
  readonly PageNo: number

  /**
   * [RevisionsAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/RevisionsAsJson.html)
   * 获取当前Word文档中痕迹的JSON对象。通常用来遍历Word文档中的痕迹。
   *
   * ### 语法
   * ```js
   * let revisionsJson = pageofficectrl.word.RevisionsAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"id":0,"date":42296.426389,"author":"张三","type":2},{"id":1,"date":42296.426389,"author":"张三","type":1},{"id":2,"date":42296.427083,"author":"李四","type":2}]
   *
   * **json对象属性:**
   * - `author` 痕迹的用户名。
   * - `date` 痕迹的日期。
   * - `type` 痕迹的类型。1：代表当前痕迹的类型为“插入”类型；2：代表当前痕迹的类型为“删除”类型；
   *
   * @example
   * ```js
   * //获取痕迹列表
   * function getRevisionList(){
   *     let revisionsJson = pageofficectrl.word.RevisionsAsJson;
   *     let revisionObj = JSON.parse(revisionsJson);
   *     //遍历痕迹
   *     for(let key in revisionObj){
   *         //goToRevision(key); //定位光标到痕迹
   *         let revisionAuthor = revisionObj[key].author; //author属性代表当前痕迹的用户名
   *         let revisionDate = revisionObj[key].date; //当前痕迹的日期
   *
   *         if (revisionObj[key].type === 1) { //type代表当前痕迹的类型为“插入”类型
   *             let revisionType = '插入';
   *             let revisionTxt = pageofficectrl.word.GetTextFromRevision(parseInt(revisionObj[key].id));//获取当前痕迹的文本内容
   *         }
   *         else if (revisionObj[key].type === 2) { //type代表当前痕迹的类型为“删除”类型
   *             let revisionType = '删除';
   *             let revisionTxt = pageofficectrl.word.GetTextFromRevision(parseInt(revisionObj[key].id));
   *         }
   *         else {
   *             let revisionType = '调整格式或样式。';
   *         }
   *     }
   * }
   *
   * //定位到某条痕迹
   * function goToRevision(key) {
   *     pageofficectrl.word.SelectRevision(key);
   * }
   * ```
   */
  readonly RevisionsAsJson: string

  /**
   * [ViewType](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/ViewType.html)
   * 设置文档视图的显示模式。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.ViewType = 1|2|3|4|5|6;
   * ```
   * 1：草稿；2：大纲视图；3：页面视图；4：打印预览视图；5：大纲视图-显示文档；6：Web版式视图。
   */
  ViewType: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * [WordCount](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/WordCount.html)
   * 属性用于统计和获取Word文档中的字数。
   *
   * ### 语法
   * ```js
   * let value = pageofficectrl.word.WordCount;
   * ```
   */
  readonly WordCount: number

  /**
   * [ZoomPercent](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E5%B1%9E%E6%80%A7/ZoomPercent.html)
   * 设置Word视图的缩放比例（百分比）。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.ZoomPercent = 75;//设置当前文档视图的缩放比例为75%
   * ```
   */
  ZoomPercent: number

  /**
   * [AddBookmark](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/AddBookmark.html)
   * 在Word文件的当前光标位置插入Word书签。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.AddBookmark(bookmarkName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.AddBookmark('bkmk1');
   * ```
   *
   * @param bookmarkName 字符串类型。书签的名称。
   */
  AddBookmark(bookmarkName: string): void

  /**
   * [AddDataRegion](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/AddDataRegion.html)
   * 在Word文件的当前光标位置插入数据区域。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.AddDataRegion(dataRegionName, dataRegionValue);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.AddDataRegion('PO_UserName', '【用户名】');
   * ```
   *
   * @param dataRegionName 字符串类型。数据区域的名称。
   * @param dataRegionValue 字符串类型。数据区域的文本内容。
   */
  AddDataRegion(dataRegionName: string, dataRegionValue: string): void

  /**
   * [AppendTableRow](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/AppendTableRow.html)
   * 与 SelectTableCell方法结合使用，实现在当前SelectTableCell方法选中的单元格的下方添加新行。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.AppendTableRow();
   * ```
   *
   * @example
   * 选中Word文档中名称为“PO_table”的书签内的第1个表格中的第2行第3列的单元格，并在此单元格的下方添加一行。
   *
   * ```js
   * pageofficectrl.word.SelectTableCell("PO_table", 1, 2, 3);
   * pageofficectrl.word.AppendTableRow(); //添加新行
   * ```
   */
  AppendTableRow(): void

  /**
   * [DeleteBookmark](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/DeleteBookmark.html)
   * 删除Word文档中指定名称的书签。只删除书签，不删除书签的内容。比如书签名称为“PO_Name”，此书签的文本内容为“【姓名】”，那么执行DeleteBookmark("PO_Name")方法后，只会删除文档中的书签“PO_Name”，而不会删除书签“PO_Name”所包含的文本内容“【姓名】”。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.DeleteBookmark(bookmarkName);
   * ```
   *
   * @example
   * ```js
   * //只删除书签，不删除书签内容
   * pageofficectrl.word.DeleteBookmark('bkmk1');
   *
   * //删除书签，并且删除书签内容
   * function deleteBookmarkAndValue(bkName){
   *     pageofficectrl.word.SelectBookmark(bkName);
   *     pageofficectrl.word.DeleteBookmark(bkName);
   *     pageofficectrl.word.SetTextToSelection("");
   * }
   * ```
   *
   * @param bookmarkName 字符串类型。书签的名称。
   */
  DeleteBookmark(bookmarkName: string): void

  /**
   * [DeleteComment](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/DeleteComment.html)
   * 删除当前Word文档中指定的键盘批注。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.DeleteComment(index);
   * ```
   *
   * @param index 整型，键盘批注的索引。index从0开始。
   */
  DeleteComment(index: number): void

  /**
   * [DeleteDataRegion](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/DeleteDataRegion.html)
   * 删除指定的数据区域。删除数据区域的书签以及书签所包含的内容。比如数据区域名称为“PO_Name”，此数据区域的文本内容为“【姓名】”，那么执行DeleteDataRegion方法后，不但删除文档中的书签“PO_Name”，而且会删除“PO_Name”书签所包含的文本内容“【姓名】”。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.DeleteDataRegion(dataRegionName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.DeleteDataRegion('PO_UserName');
   * ```
   *
   * @param dataRegionName 字符串类型。数据区域的名称。
   */
  DeleteDataRegion(dataRegionName: string): void

  /**
   * [EndKey](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/EndKey.html)
   * 方法用于将Word文件中的当前光标定位到行尾或文件的尾部。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.EndKey(type);
   * ```
   *
   * @param type 整数类型。数据区域名称。 5：行尾；6：整个文件的末尾。
   */
  EndKey(type: number): void

  /**
   * [FindNextText](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/FindNextText.html)
   * 从Word文档的当前光标位置向下查找指定字符串。返回值为布尔类型，如果找到则返回true，否则返回false。
   *
   * ### 语法
   * ```js
   * ret = pageofficectrl.word.FindNextText(txt);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.FindNextText('甲方');
   * ```
   *
   * @param txt 字符串类型。字符串文本。
   */
  FindNextText(txt: string): boolean

  /**
   * [GetTextFromBookmark](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/GetTextFromBookmark.html)
   * 获取当前Word文档中指定书签的文本内容。
   *
   * ### 语法
   * ```js
   * let bkmkText = pageofficectrl.word.GetTextFromBookmark(bookmark);
   * ```
   *
   * @param bookmark 字符串类型。书签名称。
   */
  GetTextFromBookmark(bookmark: string): string

  /**
   * [GetTextFromComment](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/GetTextFromComment.html)
   * 获取当前Word文档中指定键盘批注的文本内容。
   *
   * ### 语法
   * ```js
   * let commentText = pageofficectrl.word.GetTextFromComment(index);
   * ```
   *
   * @param index 整型，键盘批注的索引。index从0开始。
   */
  GetTextFromComment(index: number): string

  /**
   * [GetTextFromRevision](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/GetTextFromRevision.html)
   * 获取当前Word文档中某条痕迹的文本内容。
   *
   * ### 语法
   * ```js
   * let revisionText = pageofficectrl.word.GetTextFromRevision(int index);
   * ```
   * @param index 痕迹的索引。从0开始。
   */
  GetTextFromRevision(index: number): string

  /**
   * [GetTextFromSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/GetTextFromSelection.html)
   * 获取当前Word文档中被选中的文本内容。
   *
   * ### 语法
   * ```js
   * let selectText = pageofficectrl.word.GetTextFromSelection();
   * ```
   */
  GetTextFromSelection(): string

  /**
   * [GetValueFromDataRegion](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/GetValueFromDataRegion.html)
   * 获取指定数据区域的文本内容。
   *
   * ### 语法
   * ```js
   * let drValue = pageofficectrl.word.GetValueFromDataRegion(dataRegionName);
   * ```
   *
   * @example
   * ```js
   * let drValue = pageofficectrl.word.GetValueFromDataRegion('PO_UserName');
   * ```
   *
   * @param dataRegionName 字符串类型。数据区域名称。
   */
  GetValueFromDataRegion(dataRegionName: string): string

  /**
   * [HomeKey](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/HomeKey.html)
   * 定位Word文档中光标的位置。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.HomeKey(num);
   * ```
   *
   * @example
   * ```js
   * //定位光标到文档的起始位置
   * pageofficectrl.word.HomeKey(6);
   *
   * //定位光标到行首
   * pageofficectrl.word.HomeKey();
   * ```
   *
   * @param num 整数类型，可选参数。6：定位光标到文档首页的最开始位置。
   */
  HomeKey(num?: number): void

  /**
   * [InsertBreak](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertBreak.html)
   * 在Word文件的当前光标位置插入各种分隔符。一般常与DataRegion结合使用。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertBreak(breakType);
   * ```
   * > breakType 取值：
   * >
   * > 2：下一页分节符；3：连续分节符；4：偶数页分节符；5：奇数页分节符；7：分页符
   *
   * @param breakType 整数类型；表示分隔符类型。
   * @constructor
   */
  InsertBreak(breakType: 2 | 3 | 4 | 5 | 7): void

  /**
   * [InsertComment](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertComment.html)
   * 在Word文档中当前光标位置插入键盘批注。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertComment(txt);
   * ```
   *
   * @param txt 字符串类型；可选参数；表示要插入的键盘批注文本内容。
   */
  InsertComment(txt: string): void

  /**
   * [InsertDocumentFromURL](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertDocumentFromURL.html)
   * 插入指定URL的Word文件到当前光标处。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertDocumentFromURL( DocumentURL );
   * ```
   *
   * > DocumentURL：
   * >
   * > 地址必须以"/"开头的，相对于后端Web项目根目录的路径。
   *
   * @param documentUrl 字符串类型，Word文件的相对当前页面的URL位置。
   */
  InsertDocumentFromURL(documentUrl: string): void

  /**
   * [InsertHyperlink](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertHyperlink.html)
   * 方法用于在Word文件中插入超链接。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertHyperlink(Address, SubAddress, ScreenTip, TextToDisplay);
   * ```
   *
   * @param address 字符串类型，超链接地址。
   * @param subAddress 字符串类型，指定目标页面内的位置名，一般使用空字符串。
   * @param screenTip 字符串类型， 当鼠标指针放在指定的超级链接上时出现的可用作屏幕提示的文本。
   * @param textToDisplay 字符串类型，指定的超链接的显示文本。
   */
  InsertHyperlink(address: string, subAddress: string, screenTip: string, textToDisplay: string): void

  /**
   * [InsertInlineWebImage](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertInlineWebImage.html)
   * 将来自URL的图片插入到当前Word光标位置的文本行中。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertInlineWebImage( ImageURL  );
   * ```
   *
   * > 插入的图片相当于在文档中当前位置处插入了一个字符，当前文字会被插入的图片左右挤开。
   *
   * @param imageUrl 字符串类型，字符串类型，图片的Url路径。
   */
  InsertInlineWebImage(imageUrl: string): void

  /**
   * [InsertWebImage](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/InsertWebImage.html)
   * 将来自URL的图片以浮动的方式插入到当前Word光标位置。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.InsertWebImage(ImageURL, Transparent, Position);
   * ```
   *
   * > ImageURL：
   * >
   * > 地址必须以"/"开头的，相对于后端Web项目根目录的路径。
   *
   * @param imageUrl 字符串类型，字符串类型，图片的Url路径。
   * @param transparent 布尔类型，可选参数，图片是否透明。默认值：false，图片不透明；true：表示图片透明。注意：透明色为白色。
   * @param position 整数类型，可选参数，浮于文字上方还是下方。默认值：4，图片浮于文字上方。 5，表示图片衬于文字下方。
   */
  InsertWebImage(imageUrl: string, transparent?: boolean, position?: 4 | 5): void

  /**
   * [LocateDataRegion](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/LocateDataRegion.html)
   * 定位光标位置到指定数据区域。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.LocateDataRegion(dataRegionName);
   * ```
   * @example
   * ```js
   * pageofficectrl.word.LocateDataRegion('PO_UserName'); //查找并定位光标到数据区域：PO_UserName
   * ```
   *
   * @param dataRegionName 字符串类型。数据区域名称。
   */
  LocateDataRegion(dataRegionName: string): void

  /**
   * [RefreshDataRegionList](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/RefreshDataRegionList.html)
   * 在Word文档中添加了新的数据区域或者执行了删除数据区域的操作后，执行此方法可以更新PageOffice客户端对象内部的数据区域集合。仅适用于Windows客户端的情况。
   */
  RefreshDataRegionList(): void

  /**
   * [SelectBookmark](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectBookmark.html)
   * 定位光标到指定名称的书签，并选中书签。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectBookmark(bookmarkName);
   * ```
   *
   * @param bookmarkName 字符串类型。书签名称。
   */
  SelectBookmark(bookmarkName: string): void

  /**
   * [SelectComment](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectComment.html)
   * 定位光标到指定键盘批注所在位置，并选中键盘批注的内容。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectComment(index);
   * ```
   *
   * @param index 整型，键盘批注的索引。 index从0开始。
   */
  SelectComment(index: number): void

  /**
   * [SelectionCollapse](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectionCollapse.html)
   * Word文档中折叠光标，取消选中。将选定内容折叠到起始位置或结束位置。 折叠之后起始位置和结束位置相同。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectionCollapse( iDirection );
   * ```
   *
   * @param iDirection int类型。折叠光标，取消选中。取值有0和1，0：将选定内容折叠到结束位置；1：将选定内容折叠到起始位置。
   */
  SelectionCollapse(iDirection: 0 | 1): void

  /**
   * [SelectRevision](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectRevision.html)
   * 定位某条痕迹，并选中痕迹内容。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectRevision(index);
   * ```
   *
   * @param index int类型。痕迹的索引，从0开始。
   */
  SelectRevision(index: number): void

  /**
   * [SelectTableCell](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectTableCell.html)
   * 选中当前Word文档中指定书签内包含的对应表格里的指定单元格。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectTableCell(bookmark, index, row, column);
   * ```
   *
   * @example
   * 选中Word文档中名称为“PO_table”的书签内的第1个表格中的第2行第3列的单元格，并赋值为“测试的文字”。
   * ```js
   * pageofficectrl.word.SelectTableCell("PO_table", 1, 2, 3);
   * pageofficectrl.word.SetTextToSelection("测试的文字");//给选中的内容赋值
   * ```
   *
   * @param bookmark 字符串类型。书签的名称。
   * @param index 整数类型。从1开始，书签中表格的索引号。
   * @param row 整数类型。从1开始，表格中单元格的行号。
   * @param column 整数类型。从1开始，表格中单元格的列号。
   */
  SelectTableCell(bookmark: string, index: number, row: number, column: number): void

  /**
   * [SelectWholeStory](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SelectWholeStory.html)
   * 全选整篇Word文档的内容。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SelectWholeStory();
   * ```
   */
  SelectWholeStory(): void

  /**
   * [SetBackColorToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetBackColorToSelection.html)
   * 设置Word文档中当前光标位置或被选中文字的背景色
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetBackColorToSelection(color);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetBackColorToSelection(0x0000FF); //设置文字背景的颜色为红色
   * pageofficectrl.word.SetBackColorToSelection(0x00FF00); //设置文字背景的颜色为绿色
   * pageofficectrl.word.SetBackColorToSelection(0xFF0000); //设置文字背景的颜色为蓝色
   * ```
   *
   * @param color 长整数类型。BGR颜色模型的颜色值。
   */
  SetBackColorToSelection(color: number): void

  /**
   * [SetFontBold](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetFontBold.html)
   * 设置Word文档中当前光标位置或被选中文字的字体是否为粗体。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetFontBold(bBold);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetFontBold(true);//true：加粗  false：不加粗
   * ```
   *
   * @param bold 布尔类型。是否为粗体。
   */
  SetFontBold(bold: boolean): void

  /**
   * [SetFontColor](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetFontColor.html)
   * 设置Word文档中当前光标位置或被选中文字的字体颜色。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetFontColor(color);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetFontColor(0x0000FF); //设置字体颜色为红色
   * pageofficectrl.word.SetFontColor(0x00FF00); //设置字体颜色为绿色
   * pageofficectrl.word.SetFontColor(0xFF0000); //设置字体颜色为蓝色
   * ```
   *
   * @param color 长整数类型。BGR颜色模型的颜色值。
   */
  SetFontColor(color: boolean): void

  /**
   * [SetFontName](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetFontName.html)
   * 设置Word文档中当前光标位置或被选中文字的字体。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetFontName(fontName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetFontName('微软雅黑');
   * ```
   *
   * @param fontName 字符串类型。字体名称。
   */
  SetFontName(fontName: string): void

  /**
   * [SetFontSize](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetFontSize.html)
   * 设置Word文档中当前光标位置或被选中文字的字体大小。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetFontSize(fontSize);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetFontSize(48);
   * ```
   *
   * @param fontSize 整数类型。字号大小。
   */
  SetFontSize(fontSize: number): void

  /**
   * [SetHighlightToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetHighlightToSelection.html)
   * 设置Word文档中选中的文本内容是否高亮显示。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetHighlightToSelection(num);
   * ```
   *
   * @param num 整数类型。取值有0和7，0：取消高亮显示；7：开启高亮显示。
   */
  SetHighlightToSelection(num: 0 | 7): void

  /**
   * [SetTextToSelection](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetTextToSelection.html)
   * 在当前Word文档光标处插入文本。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetTextToSelection(content);
   * ```
   *
   * @param content 字符串类型。当前要插入的文本内容。
   */
  SetTextToSelection(content: string): void

  /**
   * [SetTrackRevisions](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetTrackRevisions.html)
   * 一般在docSubmitForm或者docAdmin下使用，用来设置Office工具栏的修订按钮为选中状态。用于一些特殊需求，比如，docSubmitForm模式下开始留痕功能。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetTrackRevisions(bool);
   * ```
   *
   * @param bool
   */
  SetTrackRevisions(bool: boolean): void

  /**
   * [SetValueToDataRegion](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetValueToDataRegion.html)
   * 给数据区域赋值文本内容。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetValueToDataRegion(dataRegionName, dataRegionValue);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.word.SetValueToDataRegion('PO_UserName', '张三丰');
   * ```
   *
   * @param dataRegionName 字符串类型。数据区域名称。
   * @param dataRegionValue 字符串类型。数据区域的文本内容。
   */
  SetValueToDataRegion(dataRegionName: string, dataRegionValue: string): void

  /**
   * [SetWaterMark](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/SetWaterMark.html)
   * 向Word文档中添加文字水印。仅限企业版
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.SetWaterMark(content);
   * ```
   *
   * @param content 字符串类型。水印的文本内容。
   */
  SetWaterMark(content: string): void

  /**
   * [ShowCompareView](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/ShowCompareView.html)
   * 显示Word文档的比较视图。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.ShowCompareView(type);
   * ```
   *
   * @param type int类型。取值有3个。分别为0：显示比较结果；1：显示第一个文档；2：显示第二个文档。
   */
  ShowCompareView(type: 0 | 1 | 2): void

  /**
   * [StartHandDraw](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/StartHandDraw.html)
   * 打开手写批注工具栏，开始在Word中手写批注。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.StartHandDraw();
   * ```
   */
  StartHandDraw(): void

  /**
   * [TypeParagraph](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/word/%E6%96%B9%E6%B3%95/TypeParagraph.html)
   * 在Word文档的当前光标位置插入一个回车换行。
   *
   * ### 语法
   * ```js
   * pageofficectrl.word.TypeParagraph();
   * ```
   *
   * @constructor
   */
  TypeParagraph(): void
}

interface PageOfficeCtrlZoomSeal {
  /**
   * [SealsAsJson](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E5%B1%9E%E6%80%A7/SealsAsJson.html)
   * 获取当前文档中全部印章数据的JSON对象。通常用来遍历文档中的印章。
   *
   * ### 语法
   * ```js
   * let sealsJson = pageofficectrl.zoomseal.SealsAsJson;
   * ```
   * 返回值为json字符串，例如返回值为：[{"type":"Seal","name":"李志签名","signer":"李志","signtime":"2024-10-09 15:27:33"},{"type":"Seal","name":"测试公章","signer":"李志","signtime":"2024-10-09 15:27:40"}]
   *
   * @example
   * ```js
   * //根据签章人删除印章（李志）
   * function DeleteBySigner(){
   *     let sealsJson=pageofficectrl.zoomseal.SealsAsJson;
   *     let sealObj = JSON.parse(sealsJson);
   *     for(var key in sealObj ){
   *         let sealSigner=sealObj[key].signer;
   *         if("李志"==sealSigner){
   *             pageofficectrl.zoomseal.DeleteBySigner("李志");
   *         }
   *     }
   * }
   * ```
   *
   */
  readonly SealsAsJson: string

  /**
   * [AddHandSign](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddHandSign.html)
   * 加盖实时手写签名。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.AddHandSign(UserName, Protect, PositionName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.AddHandSign();//常规签字。弹出用户名、密码输入框，此时签字后的文档是受保护的。
   * pageofficectrl.zoomseal.AddHandSign("张三");//不弹出用户名、密码输入框。直接弹出签字手写窗口，签字后的文档受保护。
   * pageofficectrl.zoomseal.AddHandSign("张三",false);//张三为签章的用户名,点击确定可直接弹出签字手写窗口，不需用填写密码，签字后的文档不受保护。
   * pageofficectrl.zoomseal.AddHandSign("", false);//弹出用户名、密码输入框。此时签字后的文档是不受保护的，即签字后还可以进行编辑等操作。
   * pageofficectrl.zoomseal.AddHandSign("", true, "Seal1");//常规指定位置签字。用户书写完签字后，签字被加盖到Word中指定印章位置。需要输入用户名和密码加盖签字到"Seal1"的签章位置处，签字后的文档受保护。
   * ```
   *
   * @param username 字符串类型。可选参数。标识签章的用户名。为空字符串时，将弹出用户名密+密码框，如果为指定的签章用户名，则直接签字手写窗口。
   * @param protect 布尔类型。可选参数。是否保护文档。true：为保护文档；false：为不保护文档。
   * @param positionName 字符串类型。可选参数。盖章位置名称，须为英文或数字，不区分大小写。
   */
  AddHandSign(username?: string, protect?: boolean, positionName?: string): void

  /**
   * [AddSeal](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSeal.html)
   * 加盖电子签章。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.AddSeal(UserName, Protect, PositionName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.AddSeal();//常规盖章。弹出用户名、密码输入框盖章，此时盖完章的文档是受保护的。
   * pageofficectrl.zoomseal.AddSeal("张三");//不弹出用户名、密码输入框盖。直接弹出印章选择框盖章，盖完章的文档受保护。
   * pageofficectrl.zoomseal.AddSeal("张三",false);//张三为签章的用户名,点击确定可直接选择印章盖章，不需用填写密码，盖完章的文档不受保护。
   * pageofficectrl.zoomseal.AddSeal("", false);//弹出用户名、密码输入框盖章。此时盖完章的文档是不受保护的，即盖完章后还可以进行编辑等操作。
   * pageofficectrl.zoomseal.AddSeal("", true, "Seal1");//常规指定位置盖章。加盖印章到模板中的指定位置。需要输入用户名和密码加盖印章到"Seal1"的签章位置处，盖完章的文档受保护。
   * ```
   *
   * @param userName 字符串类型。可选参数。标识签章的用户名。值为空字符串时，将弹出用户登录框；如果值为指定的签章用户名，则直接弹出印章选择框。
   * @param protect 布尔类型。可选参数。是否保护文档。true：为保护文档；false：为不保护文档。
   * @param positionName 字符串类型。可选参数。盖章位置名称，须为英文或数字，不区分大小写。
   */
  AddSeal(userName?: string, protect?: boolean, positionName?: string): void

  /**
   * [AddSealByName](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSealByName.html)
   * 加盖指定印章名称的电子签章。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.AddSealByName(SealName, Protect, PositionName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.AddSealByName("公司公章");//直接弹出印章进行盖章，盖完章的文档受保护。
   * pageofficectrl.zoomseal.AddSealByName("公司公章",false);//直接弹出印章进行盖章，盖完章的文档不受保护。
   * pageofficectrl.zoomseal.AddSealByName("合同章", true, "Seal1");//直接加盖“合同章”到Word中的指定印章位置"Seal1"处，盖完章的文档受保护。
   * ```
   * @param sealName 字符串类型。必选参数。印章名称。
   * @param protect 布尔类型。可选参数。是否保护文档。true：为保护文档；false：为不保护文档。
   * @param positionName  字符串类型。可选参数。盖章位置名称，须为英文或数字，不区分大小写。
   */
  AddSealByName(sealName: string, protect?: boolean, positionName?: string): void

  /**
   * [AddSealPosition](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSealPosition.html)
   * 编辑Word模板时，在Word模板中预设置印章的盖章位置。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.AddSealPosition();
   * ```
   *
   * @example
   * 比如下面的代码直接加盖“合同章”到Word文档中“Seal1”的印章位置，就需要在编辑Word合同模板时就使用AddSealPosition方法让用户设置好印章位置，之后使用此合同模板创建了正式的文档，就可以调用下面的代码直接盖章到指定位置了。
   * ```js
   * //直接加盖“合同章”到Word中的指定印章位置"Seal1"处，盖完章的文档受保护。
   * pageofficectrl.zoomseal.AddSealByName("合同章", true, "Seal1");
   * ```
   */
  AddSealPosition(): void

  /**
   * [AddSealQFZ](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSealQFZ.html)
   * 给Word文档加盖骑缝章。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.AddSealQFZ(UserName, Protect);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.AddSealQFZ();//常规盖章。弹出用户名、密码输入框盖章，此时盖完章的文档是受保护的。
   * pageofficectrl.zoomseal.AddSealQFZ("张三");//不弹出用户名、密码输入框盖。直接弹出印章选择框盖章，盖完章的文档受保护。
   * pageofficectrl.zoomseal.AddSealQFZ("张三",false);//张三为签章的用户名,点击确定可直接选择印章盖章，不需用填写密码，盖完章的文档不受保护。
   * ```
   *
   * @param username 字符串类型。可选参数。标识签章的用户名。为空字符串时，将弹出用户名密+密码框，如果为指定的签章用户名，则直接弹出印章选择框。
   * @param protect 布尔类型。可选参数。是否保护文档。true：为保护文档；false：为不保护文档。
   */
  AddSealQFZ(username?: string, protect?: boolean): void

  /**
   * [DeleteByName](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/DeleteByName.html)
   * 删除指定印章名称的电子印章。如果文档中指定名称的印章有多个，那么就会删除最后一次加盖的那个。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.DeleteByName(SealName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.DeleteByName("公司公章");//删除文档中最后一次加盖的那个“公司公章”。
   * ```
   *
   * @param sealName 字符串类型。必选参数。印章名称。
   */
  DeleteByName(sealName: string): void

  /**
   * [DeleteBySigner](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/DeleteBySigner.html)
   * 删除指定用户加盖的电子印章。如果文档中指定用户加盖的印章有多个，那么就会删除最后一次加盖的那个。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.DeleteBySigner(SignerName);
   * ```
   *
   * @example
   * ```js
   * pageofficectrl.zoomseal.DeleteBySigner("李志");//删除文档中用户“李志”最后一次加盖的印章。
   * ```
   * @param singerName 字符串类型。必选参数。印章用户名。
   */
  DeleteBySigner(singerName: string): void

  /**
   * [LocateSealPosition](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/LocateSealPosition.html)
   * 在文件中定位焦点到指定名称的预设盖章位置。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.LocateSealPosition(PositionName);
   * ```
   *
   * > 如果想要盖章或（手写）签批到文档指定位置处，则必须先使用LocateSealPosition方法定位到签章指定位置，然后再进行盖章或者（手写）签批。
   *
   * @example
   * 比如在编辑Word模板时使用AddSealPosition方法让用户在Word文件中设置好了“Seal1”的印章位置，下面的代码就能定位焦点到Word文档中“Seal1”的印章位置。
   * ```js
   * pageofficectrl.zoomseal.LocateSealPosition("Seal1");
   * ```
   *
   * @param positionName 字符串类型。必选参数。预设印章位置的名称，标识盖章指定位置，须为英文或数字，不区分大小写。
   */
  LocateSealPosition(positionName: string): void

  /**
   * [SealPositionExists](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/SealPositionExists.html)
   * 判断Word文件中是否存在指定名称的印章位置。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.SealPositionExists(SealPositionName);
   * ```
   *
   * @example
   * ```js
   * // 判断Word文档中是否存在印章位置“Seal1”
   * pageofficectrl.zoomseal.SealPositionExists("Seal1");
   * ```
   *
   * @param sealPositionName 字符串类型。必选参数。预设印章位置的名称。
   */
  SealPositionExists(sealPositionName: string): void

  /**
   * [ShowSettingsBox](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/ShowSettingsBox.html)
   * 弹出印章系统设置对话框。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.ShowSettingsBox();
   * ```
   *
   * > 弹出印章系统设置对话框，在对话框中用户可自行修改签章密码（6-20位）。
   */
  ShowSettingsBox(): void

  /**
   * [VerifySeal](https://www.zhuozhengsoft.com/help/js6/pageofficectrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/VerifySeal.html)
   * 验证电子签章的有效性。
   *
   * ### 语法
   * ```js
   * pageofficectrl.zoomseal.VerifySeal();
   * ```
   *
   * > 弹出印章验证结果对话框，如果文档通过验证，对话框里会显示当前文档中的所有有效印章的列表。
   */
  VerifySeal(): void
}

export interface CallParentFuncParams {
  /**
   * 回调父页面的函数名
   */
  funcName: string
  /**
   * 传递参数
   */
  paramJson: string
  /**
   * 回调成功，获取回调函数的返回值：strRet
   * @param strRet
   */
  success: (strRet: string) => void
  /**
   * 回调失败，获取错误信息：strErr
   * @param strErr
   */
  error: (strErr: string) => void
}

export interface PageOfficePageMounted {
  /**
   * [AfterDocumentOpened](https://www.zhuozhengsoft.com/help/js6/window/%E4%BA%8B%E4%BB%B6/AfterDocumentOpened.html)
   * 事件，在文档打开完毕时执行指定的JavaScript函数。
   *
   * ### 语法
   * ```js
   * function AfterDocumentOpened(){
   *   //此处代码一般是需要文档加载完毕时要执行的代码，比如常见的显示/隐藏痕迹，禁止另存，禁止打印等。
   * }
   * ```
   *
   * > 此事件很常用。只要您在当前PageOffice控件所在页面的javascript中添加此function代码，即可触发该事件。
   *
   * @example
   * ```js
   * function AfterDocumentOpened() {
   *    //打开文件后默认显示痕迹
   *    pageofficectrl.ShowRevisions = true;
   * }
   * ```
   */
  AfterDocumentOpened(): void

  /**
   * [OnBeforeBrowserClosed](https://www.zhuozhengsoft.com/help/js6/window/%E4%BA%8B%E4%BB%B6/OnBeforeBrowserClosed.html)
   * 事件，是POBrowser窗口关闭时触发的事件。
   *
   * ### 语法
   * ```js
   * function OnBeforeBrowserClosed(){
   *     // 此处可以执行窗口关闭前需要执行的业务逻辑代码
   *
   *     // 如果当前页面调用的PageOfficeCtrl控件，执行下面代码关闭窗口
   *     pageofficectrl.CloseWindow(true);//必须。否则窗口不会关闭。
   *     // 或者如果当前页面调用的PDFCtrl控件，执行下面代码关闭窗口
   *     //pdfctrl.CloseWindow(true);//必须。否则窗口不会关闭。
   * }
   * ```
   *
   * > 只要您在当前PageOffice控件所在页面的javascript中添加此function代码，即可触发该事件。
   *
   * @example
   * 以关闭窗口前判断文件是否修改的状态，提示用户是否继续关闭窗口为例：
   * ```js
   * function OnBeforeBrowserClosed() {
   *     if(pageofficectrl.IsDirty){
   *         if (confirm("提示：文档已被修改，是否继续关闭放弃保存 ？")) {
   *             pageofficectrl.CloseWindow(true);
   *         }
   *     }else{
   *         pageofficectrl.CloseWindow(true);
   *     }
   * }
   * ```
   */
  OnBeforeBrowserClosed(): void

  /**
   * [OnExcelCellClick](https://www.zhuozhengsoft.com/help/js6/window/%E4%BA%8B%E4%BB%B6/OnExcelCellClick.html)
   * 事件是点击Excel文件中单元格时触发的JavaScript函数。通常用于点击单元格时，执行一些功能，比如弹出一个div窗口等。
   *
   * ### 语法
   * ```js
   * function OnExcelCellClick(CellAddress, Value, Left, Bottom){
   *
   * }
   * ```
   * > 只要您在当前PageOffice控件所在页面的javascript中添加此function代码，即可使用该事件。
   *
   * @example
   * ```js
   * function OnExcelCellClick(CellAddress, Value, Left, Bottom) {
   *     if (CellAddress == "$B$2") {
   *         alert('B2被点击了！值为：' + Value);
   *     }
   * }
   * ```
   * @param cellAddress 字符串类型，单元格的地址，比如：\$A\$1、\$B\$2等。
   * @param value 字符串类型，单元格的文本内容。
   * @param left 整数类型，当前光标在文件中的Left位置。（已废弃）
   * @param bottom 整数类型，当前光标在文件中的Bottom位置。（已废弃）
   */
  OnExcelCellClick(cellAddress: string, value: string, left: number, bottom: number): void

  /**
   * [OnPageOfficeCtrlInit](https://www.zhuozhengsoft.com/help/js6/window/%E4%BA%8B%E4%BB%B6/OnPageOfficeCtrlInit.html)
   * 事件，是PageOffice控件初始化时触发的JavaScript函数。通常用于初始化控件时，在前端页面添加自定义按钮，修改控件标题等功能。
   *
   * ### 语法
   * ```js
   * function OnPageOfficeCtrlInit(){
   *     // 此处可以执行添加自定义按钮，修改控件标题等代码
   * }
   * ```
   *
   * > 只要您在当前PageOffice控件所在页面的javascript中添加此function代码，即可触发该事件。
   *
   * @example
   * ```js
   * function OnPageOfficeCtrlInit(){
   *     pageofficectrl.AddCustomToolButton("保存", "Save()", 1); //添加自定义按钮
   *     pageofficectrl.Caption = "新的控件标题"; //修改控件标题
   *  }
   * ```
   */
  OnPageOfficeCtrlInit(): void

  /**
   * [OnPDFCtrlInit](https://www.zhuozhengsoft.com/help/js6/window/%E4%BA%8B%E4%BB%B6/OnPDFCtrlInit.html)
   * 事件，是PDF控件初始化时触发的JavaScript函数。通常用于初始化控件时，在前端页面添加自定义按钮，修改控件标题等功能。
   *
   * ### 语法
   * ```js
   * function OnPDFCtrlInit(){
   *     // 此处可以执行添加自定义按钮，修改控件标题等代码
   * }
   * ```
   * > 只要您在当前PDF控件所在页面的javascript中添加此function代码，即可触发该事件。
   *
   * @example
   * ```js
   * function OnPDFCtrlInit(){
   *     pdfctrl.AddCustomToolButton("保存", "Save()", 1); //添加自定义按钮
   *     pdfctrl.Caption = "新的控件标题"; //修改控件标题
   * }
   * ```
   */
  OnPDFCtrlInit(): void
}

interface PageOfficeCtrlPDFZoomSeal {
  /**
   * [AddHandSign](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddHandSign.html)
   * 加盖实时手写签名。
   *
   * ### 语法
   * ```js
   * pdfctrl.zoomseal.AddHandSign();
   * ```
   */
  AddHandSign(): void

  /**
   * [AddSeal](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSeal.html)
   * 加盖电子印章。
   *
   * ### 语法
   * ```js
   * pdfctrl.zoomseal.AddSeal(UserName);
   * ```
   *
   * @example
   * ```js
   * pdfctrl.zoomseal.AddSeal();//常规盖章。弹出用户名、密码输入框盖章。
   * pdfctrl.zoomseal.AddSeal("张三");//无需输入用户名和密码，直接弹出用户的印章选择框盖章。
   * ```
   *
   * @param username 字符串类型。可选参数。标识签章的用户名。值为空字符串时，将弹出用户登录框；如果值为指定的签章用户名，则直接弹出印章选择框。
   */
  AddSeal(username?: string): void

  /**
   * [AddSealByName](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/AddSealByName.html)
   * 加盖指定印章名称的电子签章。
   *
   * ### 语法
   * ```js
   * pdfctrl.zoomseal.AddSealByName(SealName);
   * ```
   *
   * @example
   * ```js
   * pdfctrl.zoomseal.AddSealByName("公司公章");//直接弹出印章进行盖章。
   * ```
   *
   * @param sealName
   */
  AddSealByNam(sealName: string): void

  /**
   * [DeleteLastSeal](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/DeleteLastSeal.html)
   * 删除文档中最后一次加盖的电子印章。
   *
   * ### 语法
   * ```js
   * pdfctrl.zoomseal.DeleteLastSeal();
   * ```
   */
  DeleteLastSeal(): void

  /**
   * [ShowSettingsBox](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/zoomseal/%E6%96%B9%E6%B3%95/ShowSettingsBox.html)
   * 弹出印章系统设置对话框。
   *
   * ### 语法
   * ```js
   * pdfctrl.zoomseal.ShowSettingsBox();
   * ```
   *
   * > 弹出印章系统设置对话框，在对话框中用户可自行修改签章密码（6-20位）。
   */
  ShowSettingsBox(): void
}

interface PageOfficeCtrlPDF {
  /**
   * [BookmarksVisible](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/BookmarksVisible.html)
   * 属性：设置PDF文件中的目录书签的可见性，可读写。
   *
   * ### 语法
   * ```js
   * pdfctrl.BookmarksVisible = true|false;
   * ```
   * > 默认值为true。当PDF文件中存在目录书签时，BookmarksVisible属性才会有效。
   */
  BookmarksVisible: boolean

  /**
   * [Caption](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/Caption.html)
   * 属性：设置或获取 PDFCtrl 控件的标题，可读写。
   *
   * ### 语法
   * ```js
   * pdfctrl.Caption = Value;//设置Caption的值
   * strValue = pdfctrl.Caption;//获取Caption的值
   * ```
   *
   * > 属性Caption设置或获取的是 PDFCtrl 控件的标题栏里的文字，而非整个页面的Title值。
   */
  Caption: string

  /**
   * [ClientOS](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/ClientOS.html)
   * 属性获取当前客户端电脑的操作系统类型，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * var osInfo = pdfctrl.ClientOS;
   * ```
   *
   * > 此功能主要是用于获取客户端电脑属于Windows平台还是Linux平台。
   */
  readonly ClientOS: string

  /**
   *  [CustomToolbar](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/CustomToolbar.html)
   *  属性可设置是否显示用户自定义工具栏，布尔类型，可读写。
   *
   *  ### 语法
   *  ```js
   *  pdfctrl.CustomToolbar = true|false;//false：不显示;true：显示
   *  ```
   *
   *  > 默认值为true。用户可自定义js函数来控制是否显示用户自定义工具栏。
   */
  CustomToolbar: boolean

  /**
   * [FullScreen](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/FullScreen.html)
   * 属性设置控件窗口是否全屏显示，可读写。
   *
   * ### 语法
   * ```js
   * pdfctrl.FullScreen = true|false;
   * ```
   *
   * > 默认值为false：普通嵌入窗口大小；true：全屏
   */
  FullScreen: boolean

  /**
   * [SaveFilePage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/SaveFilePage.html)
   * 设置控件的处理文档保存的后端地址。此属性是 PDFCtrl 控件的重要属性。SaveFilePage指向的后端地址用来接收 PDFCtrl 控件提交的文档。当 PDFCtrl 控件就会提交文档的二进制流到SaveFilePage指定的后端地址。
   *
   * ### 语法
   * ```js
   * pdfctrl.SaveFilePage = '后端API方法地址';
   * ```
   */
  SaveFilePage: string

  /**
   * [WindowParams](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E5%B1%9E%E6%80%A7/WindowParams.html)
   * 属性获取父页面中POBrowser.openWindow()方法的第三个参数的值，字符串类型，只读。
   *
   * ### 语法
   * ```js
   * let value = pdfctrl.WindowParams;
   * ```
   *
   * @example
   * 1. 调用openWindow的页面（父页面）传递参数。
   * ```js
   * let paramJson={};
   * paramJson.file_id=1;
   * paramJson.file_name="test.doc";
   * let paramString=JSON.stringify(paramJson);
   *
   * //openWindow()第三个参数用来向弹出的PageOffice浏览器（POBrowser）窗口传递参数(参数长度不限)，支持json字符串。
   * //此处为了方便演示，我们传递了file_id和file_name两个参数，具体以您实际开发为准。
   * POBrowser.openWindow('SimplePDF/PDF', 'width=1050px;height=900px;',paramString);
   * ```
   *
   * 2. 弹出的PageOffice浏览器（POBrowser）窗口使用pdfctrl.WindowParams获取参数。
   * ```js
   * //使用pdfctrl.WindowParams获取获取父页面中POBrowser.openWindow()方法的第三个参数的值，为字符串类型
   * let paramStr = pdfctrl.WindowParams;
   * alert(paramStr);
   * ```
   */
  readonly WindowParams: string

  zoomseal: PageOfficeCtrlPDFZoomSeal

  /**
   * [AddCustomToolButton](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/AddCustomToolButton.html)
   * 给自定义工具栏添加自定义按钮。
   *
   * ### 语法
   * ```js
   * pdfctrl.AddCustomToolButton(caption, jsFunction , iconIndex);
   * ```
   *
   * **PageOffice内置图标索引如下：**
   *
   * ![内置图标索引](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/PdfCustomToolbuttonIcons.png)
   *
   * @example
   * ```js
   *  pdfctrl.AddCustomToolButton("保存", "SaveDocument()", 1);
   *  pdfctrl.AddCustomToolButton("打印", "ShowPrintDlg()", 6);
   *  pdfctrl.AddCustomToolButton("全屏切换", "SwitchFullScreen()", 4);
   *  ```
   *
   * @param caption 字符串类型。按钮的标题。如果 caption 定义为 "-"，表示此按钮是分隔线。
   * @param funcName 字符串类型。JavaScript 函数的名字。当用户点击当前按钮时触发此 JavaScript 函数。
   * @param iconIndex int类型。按钮图标的索引。PageOffice内置了若干图标，您可以选择使用其中的图标。默认值是 0。
   */
  AddCustomToolButton(caption: string, funcName: string, iconIndex: number): void

  /**
   * [CloseWindow](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/CloseWindow.html)
   * 方法用来关闭POBrowser浏览器窗口。
   *
   * ### 语法
   * ```js
   * pdfctrl.CloseWindow(bForce);
   * ```
   *
   * @param force 布尔类型，是否强制关闭窗口。默认值false：不强制关闭窗口，会触发OnBeforeBrowserClosed事件。true：会强制关闭窗口，不会触发OnBeforeBrowserClosed事件。
   */
  CloseWindow(force?: boolean): void

  /**
   * [GoToFirstPage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/GoToFirstPage.html)
   * 跳转到首页。
   *
   * ### 语法
   * ```js
   * pdfctrl.GoToFirstPage();
   * ```
   *
   */
  GoToFirstPage(): void

  /**
   * [GoToLastPage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/GoToLastPage.html)
   * 跳转到尾页。
   *
   * ### 语法
   * ```js
   * pdfctrl.GoToLastPage();
   * ```
   */
  GoToLastPage(): void

  /**
   * [GoToNextPage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/GoToNextPage.html)
   * 跳转到下一页。
   *
   * ### 语法
   * ```js
   * pdfctrl.GoToNextPage();
   * ```
   */
  GoToNextPage(): void

  /**
   * [GoToPage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/GoToPage.html)
   * 跳转到指定的页面。
   *
   * ### 语法
   * ```js
   * pdfctrl.GoToPage(PageNumber);
   * ```
   *
   * > PageNumber 取值：
   * >
   * > 当设置的页码大于文件的实际页数时，调用该函数是无效的。
   *
   * @param pageNumber 整数类型，取值为大于零的整数。页码。
   *
   */
  GoToPage(pageNumber: number): void

  /**
   * [GoToPreviousPage](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/GoToPreviousPage.html)
   * 跳转到上一页。
   *
   * ### 语法
   * ```js
   * pdfctrl.GoToPreviousPage();
   * ```
   */
  GoToPreviousPage(): void

  /**
   * [PrintOut](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/PrintOut.html)
   * 不显示打印对话框，直接打印当前文档。
   *
   * ### 语法
   * ```js
   * pdfctrl.PrintOut(PrinterName, Copies, FromPage, ToPage);
   * ```
   *
   * @example
   * ```js
   * //调用客户端本地默认的打印机，打印一份，批量打印时常用此写法
   * pdfctrl.PrintOut();
   * //调用客户端本地默认的打印机，打印一份，从第一页开始，第二页结束
   * pdfctrl.PrintOut("",1,1,2);
   * ```
   *
   * @param printerName 字符串类型，打印机的名称。
   * @param copies 整数类型，可选参数，默认1份。设置打印的份数。
   * @param fromPage 整数类型，可选参数，默认0；设置打印从几页开始。
   * @param toPage 整数类型，可选参数，默认0；设置打印至第几页结束。
   */
  PrintOut(printerName: string, copies?: number, fromPage?: number, toPage?: number): void

  /**
   * [Reload](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/Reload.html)
   * 重新加载PageOffice客户端控件。一般来说，此方法用于前后端分离项目，比如Vue项目中重新请求后台Controller方法后，控件显示空白不加载时就需要调用此方法重新加载控件。
   *
   * ### 语法
   * ```js
   * pdfctrl.Reload();
   * ```
   */
  Reload(): void

  /**
   * [RotateLeft](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/RotateLeft.html)
   * 将文档页面逆时针旋转90度显示。
   *
   * ### 语法
   * ```js
   * pdfctrl.RotateLeft();
   * ```
   *
   * > 只是在显示时将页面逆时针旋转了90度，并不改变文件内容。
   */
  RotateLeft(): void

  /**
   * [RotateRight](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/RotateRight.html)
   * 将文档页面顺时针旋转90度显示。
   *
   * ### 语法
   * ```js
   * pdfctrl.RotateRight();
   * ```
   * > 只是在显示时将页面顺时针旋转了90度，并不改变文件内容。
   */
  RotateRight(): void

  /**
   * [SetPageFit](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/SetPageFit.html)
   * 方法切换页面显示模式。
   *
   * ### 语法
   * ```js
   * pdfctrl.SetPageFit(FitMode);
   * ```
   *
   * @param fitMode 无符号整数类型，取值范围{1,2,3}。1：实际大小；2：适合页面；3：适合宽度。
   */
  SetPageFit(fitMode: 1 | 2 | 3): void

  /**
   * [ShowDialog](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/ShowDialog.html)
   * 显示对话框；参数为对话框类型。
   *
   * ### 语法
   * ```js
   * pdfctrl.ShowDialog(dlgType);
   * ```
   *
   * > dlgType 取值：
   * >
   * > 1:打开 2:保存 3:另存为 4:打印
   *
   * @param dlgType 显示对话框；参数为对话框类型，取值为{ 1,2,3,4 }。
   */
  ShowDialog(dlgType: 1 | 2 | 3 | 4): void

  /**
   * [WebSave](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/WebSave.html)
   * 保存当前文档到服务器。
   *
   * ### 语法
   * ```js
   * pdfctrl.WebSave();
   * ```
   *
   * > 这是PageOffice非常重要的客户端函数，自定义工具栏保存按钮保存文档时需要调用本函数。 此方法不是本地文件另存，而是保存到服务器端。
   *
   * @example
   * ```js
   * function saveFile(){
   *     pdfctrl.WebSave();// 保存到服务器
   *     location.href = "list.aspx";//保存成功后跳转到另一个页面；如不想跳转，此句可省略
   * }
   * ```
   */
  WebSave(): void

  /**
   * [ZoomIn](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/ZoomIn.html)
   * 方法用于放大视图。
   *
   * ### 语法
   * ```js
   * pdfctrl.ZoomIn();
   * ```
   */
  ZoomIn(): void

  /**
   * [ZoomOut](https://www.zhuozhengsoft.com/help/js6/pdfctrl/%E6%96%B9%E6%B3%95/ZoomOut.html)
   * 方法用于缩小视图。
   *
   * ### 语法
   * ```js
   * pdfctrl.ZoomOut();
   * ```
   */
  ZoomOut(): void
}

interface CallFileMakerParams {
  url: string
  success: (res: string) => void
  progress: (pos: number) => void
  error: (msg: string) => void
}

interface FileMakerCtrl {
  /**
   * [SaveFilePage](https://www.zhuozhengsoft.com/help/js6/filemakerctrl/%E5%B1%9E%E6%80%A7/SaveFilePage.html)
   * 设置 FileMakerCtrl 控件的文档保存接口地址。此属性是 FileMakerCtrl 控件的重要属性，此后端Action地址用来接收 FileMakerCtrl 控件生成的文档。
   * FileMakerCtrl的SaveFilePage用法与PageOfficeCtrl的SaveFilePage用法完全相同。
   *
   * ### 语法
   * ```js
   * filemakerctrl.SaveFilePage = "后端用来接收和保存FileMakerCtrl控件生成文档的接口地址";
   * ```
   *
   * @example
   * ```js
   * filemakerctrl.SaveFilePage="/SaveMaker.jsp";
   * ```
   */
  SaveFilePage: string

  /**
   * [CallFileMaker](https://www.zhuozhengsoft.com/help/js6/filemakerctrl/%E6%96%B9%E6%B3%95/CallFileMaker.html)
   * 方法是pageoffice.js文件中封装好的filemakerctrl对象的方法，用来调用集成了FileMakerCtrl对象的后台方法实现无界面动态生成文档功能。
   *
   * ### 语法
   * ```js
   * filemakerctrl.CallFileMaker({
   *     url: "集成了FileMakerCtrl对象的后台方法地址",
   *     success: function (res) {//res：获取服务器端fs.setCustomSaveResult设置的保存结果
   *         console.log(res);
   *         console.log("completed successfully.");
   *     },
   *     progress: function (pos) {
   *         console.log("running "+pos+"%");
   *     },
   *     error: function (msg) {
   *         console.log("error occurred: "+msg);
   *     }
   * });
   * ```
   *
   * @example
   * ```js
   * filemakerctrl.CallFileMaker({
   *     url: "FileMaker.jsp?id=123",
   *     success: function (res) {//res：获取服务器端fs.setCustomSaveResult设置的保存结果
   *         console.log(res);
   *         console.log("completed successfully.");
   *     },
   *     progress: function (pos) {
   *         console.log("running "+pos+"%");
   *     },
   *     error: function (msg) {
   *         console.log("error occurred: "+msg);
   *     }
   * });
   * ```
   */
  CallFileMaker(p: CallFileMakerParams): void

  /**
   * [SetPrint](https://www.zhuozhengsoft.com/help/js6/filemakerctrl/%E6%96%B9%E6%B3%95/SetPrint.html)
   * 方法用于FileMaker组件生成文件后自动执行文件的打印操作。在调用filemakerctrl.CallFileMaker()方法之前，需要先调用SetPrint方法，那么在调用filemakerctrl.CallFileMaker()方法生成文件之后，FileMaker组件就会自动打印生成的文件。
   *
   * ### 语法
   * ```js
   * filemakerctrl.SetPrint(PrinterName, Copies, FromPage, ToPage);
   * ```
   *
   * @example
   * ```js
   * //调用客户端本地默认的打印机，打印一份，批量打印时常用此写法
   * filemakerctrl.SetPrint();
   * //调用客户端本地默认的打印机，打印一份，从第一页开始，第二页结束
   * filemakerctrl.SetPrint("",1,1,2);
   * ```
   *
   * @param printerName 字符串类型，打印机的名称。
   * @param copies 整数类型，可选参数，默认1份。设置打印的份数。
   * @param fromPage 整数类型，可选参数，默认0；设置打印从几页开始。
   * @param toPage 整数类型，可选参数，默认0；设置打印至第几页结束。
   */
  SetPrint(printerName: string, copies?: number, fromPage?: number, toPage?: number): void
}

declare module 'js-pageoffice' {
  export const POBrowser: IPOBrowser

  export const filemakerctrl: FileMakerCtrl
}

declare global {
  interface Window {
    /**
     * [CallParentFunc](https://www.zhuozhengsoft.com/help/js6/window/%E6%96%B9%E6%B3%95/CallParentFunc.html)
     * 用于POBrowser打开的页面（子页面）回调父页面JS函数。
     *
     * ### 语法
     * ```js
     * window.CallParentFunc({
     *      funcName: '回调父页面的函数名',
     *      paramJson: 'json字符串', //传递参数
     *      success: function (strRet) { //回调成功，获取回调函数的返回值：strRet
     *      },
     *      error: function (strErr) { //回调失败，获取错误信息：strErr
     *      }
     * });
     * ```
     * CallParentFunc回调函数原型：
     * ```js
     * // FuncName：自定义函数名。此函数有且只能有一个字符串参数。
     * // paramJson：json字符串，用于回调时传递参数。
     * function FuncName(paramJson){
     *     // 此处编写您的js代码
     *
     *     return '';// 返回值为字符串类型
     * }
     * ```
     *
     * @example
     * 假设，父页面有一个刷新页面的函数如下：
     * ```js
     * function refresh(){
     *      window.location.reload();
     * }
     * ```
     * 子页面窗口关闭前调用父页面的refresh函数
     * ```js
     * function ClosePage() {
     *     window.CallParentFunc({
     *         funcName: 'refresh', //回调父页面的函数名
     *         paramJson: '',
     *         success: function (strRet) { //回调成功，关闭窗口
     *                pageofficectrl.CloseWindow();
     *         },
     *         error: function (strErr) {
     *             if(strErr.indexOf('parentlost')>-1){
     *                 alert('父页面关闭或跳转刷新了，导致父页面函数没有调用成功！');
     *                 return;
     *             }
     *         }
     *     });
     * }
     * ```
     */
    CallParentFunc(p: CallParentFuncParams): void

    /**
     * 将需要回调的函数挂载到PageOffice控件，例如控件触发的事件、自定义按钮触发的函数。
     */
    POPageMounted: PageOfficePageMounted | Record<string, () => void>
  }

  const pageofficectrl: PageOfficeCtrl

  const pdfctrl: PageOfficeCtrlPDF
}
