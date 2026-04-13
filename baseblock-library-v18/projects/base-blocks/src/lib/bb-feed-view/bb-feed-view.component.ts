import { Component, EventEmitter, Input, OnInit, AfterViewInit, Output, TemplateRef, ViewContainerRef, ViewChild, NgZone, Renderer2, SimpleChanges, ChangeDetectorRef, ViewEncapsulation, ElementRef } from "@angular/core";
import { BBFeedViewService } from "./bb-feed-view.service";
import { map } from "rxjs/operators";
import { MetaDataNodeObj } from "./MetaDataNodeObj"
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe, KeyValue } from '@angular/common';
import { AppDateAdapter, APP_DATE_FORMATS } from './date.adapter';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BBTextboxComponent } from '../bb-textbox/bb-textbox.component';
import { BBTextAreaComponent } from '../bb-text-area/bb-text-area.component';

@Component({
  selector: "bb-feed-view",
  templateUrl: "./bb-feed-view.component.html",
  styleUrls: ["./bb-feed-view.component.css"],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    },
    DatePipe
  ],

})
export class BBFeedViewComponent implements OnInit, AfterViewInit {
  @Input() feedFormData: any;
  // @Input() feedFormNo: any;
  @Input('feedFormNo') feedFormNo: any;
  @Input() feedIndex: any;
  @Input() editFlag: any;
  @Input() pluginMetadata: any;
  @Input() allformValues: any;
  @Input() userInfo: any;
  @Input() popHelpFieldList: any = [];
  @Input() objectDetails: any;
  @Output() bbSpinner: EventEmitter<any> = new EventEmitter();
  @Output() callItemchangeForFeedView: EventEmitter<any> = new EventEmitter();
  @Output() focusOnFeedView: EventEmitter<any> = new EventEmitter();
  @Output() blurOnFeedView: EventEmitter<any> = new EventEmitter();
  @Output() onCloseClick: EventEmitter<any> = new EventEmitter();
  @Output() onDoneClick: EventEmitter<any> = new EventEmitter();
  @Output() onOpenPophelp: EventEmitter<any> = new EventEmitter();
  @ViewChild('BBexpandAndCollapseTemp') BBexpandAndCollapseTemp: TemplateRef<any> | any;
  @Output() feedFormDataChanged: EventEmitter<any> = new EventEmitter();
  @Input() transMode: any = '';
  FormData: any[] = [];
  currentDetail: any = "";
  metadataMap: Map<string, string> | any = "";
  visibleColObj: string;
  beanGrpObj: any = "";
  beanColObj: any = "";
  yCordGrpMap = new Map<number, Map<number, any>>();
  labelMapData: Map<string, any> = new Map();
  optionsMap: Map<string, any> = new Map();
  groupBoxOverlay!: OverlayRef;
  currElemId: any;
  isExpanded: boolean = false;
  showContextMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  private contextMenuEl: HTMLElement | null = null;
  private contextBackdropEl: HTMLElement | null = null;
  formTitle: any = "";
  compData: any = [];
  primaryKeyField: any = "";
  shouldSetLoading: boolean = true;
  // arrayOfDateFields: any = [];//added by mayuri on 13 feb 2024
  private tempData: any = {};//added by mayuri on 13 feb 2024
  @Input('popHelpRef') popHelpRef: any;
  @Input('pophelpDataList') pophelpDataList: any;
  @Input('paramData') currentCompData: any;
  @Input('formWiseFormatJson') formWiseFormatJson: any;

  @Output() itemChangeValues: EventEmitter<any> = new EventEmitter();
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter();
  @Output() onDelete: EventEmitter<any> = new EventEmitter();//added by mayuri on 13 feb 2024
  feedDomId: any;//added by mayuri on 21-06-2024
  @Input('primaryKey') primaryKey: any; //added by mayuri 21-06-2024
  @Input() callApiForSimpleLayout: boolean = false;
  @Input() tokenID: any;
  @Input() jSessionId: any;
  @ViewChild('textbox') textbox: BBTextboxComponent | any;
  @ViewChild('textarea') textarea: BBTextAreaComponent | any;
  @Output() autoSuggSelectedData: EventEmitter<any> = new EventEmitter();
  @Output() bbFeedSetFocusOnError = new EventEmitter<object>();
  // Add this sort function
  // keyAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
  //   return a.key.localeCompare(b.key);
  // };
  bbTextArHeight: any = '40px !important';
  private resizeObserver: ResizeObserver | null = null;

  constructor(public feedViewService: BBFeedViewService, private overlay: Overlay, private viewContainerRef: ViewContainerRef,
    private datePipe: DatePipe, public renderer: Renderer2, private cdr: ChangeDetectorRef, private elRef: ElementRef) { }

  ngAfterViewInit(): void {
    try {
      const formContentDiv = this.elRef.nativeElement.querySelector('.formContentDiv');
      if (formContentDiv) {
        this.resizeObserver = new ResizeObserver(() => {
          this.adjustFeedGroupBox();
        });
        this.resizeObserver.observe(formContentDiv);
      }
    } catch (e: any) {
      console.log('Exception inside feed view ResizeObserver ', e.message);
    }
  }

  adjustFeedGroupBox() {
    const groupBoxes = this.elRef.nativeElement.querySelectorAll('.e12GroupBox');
    for (let i = 0; i < groupBoxes.length; i++) {
      const groupBox = groupBoxes[i] as HTMLElement;
      const groupBoxPnl = groupBox.children[1] as HTMLElement;
      if (!groupBoxPnl) continue;
      const width = groupBoxPnl.offsetWidth;

      if (width < 450) {
        groupBoxPnl.classList.add('freeFormContentOneColumn');
        groupBoxPnl.classList.remove('freeFormContentThreeColumn');
        groupBoxPnl.classList.remove('freeFormContentTwoColumn');
      } else if (width >= 450 && width < 1024) {
        groupBoxPnl.classList.add('freeFormContentTwoColumn');
        groupBoxPnl.classList.remove('freeFormContentOneColumn');
        groupBoxPnl.classList.remove('freeFormContentThreeColumn');
      } else {
        groupBoxPnl.classList.add('freeFormContentThreeColumn');
        groupBoxPnl.classList.remove('freeFormContentOneColumn');
        groupBoxPnl.classList.remove('freeFormContentTwoColumn');
      }
    }
  }

  ngOnInit(): void {
    this.compData = this.pluginMetadata["compData"];
    // this.currentCompData = JSON.stringify(this.feedFormData);
    this.currentCompData = this.feedFormData;
    this.feedDomId = this.feedFormData.domID;
    this.formateDateFields();
    if (this.transMode == 'I') {
      this.currentCompData = this.allformValues;
      // console.log("print line no 96 currentCompData",this.currentCompData);
      this.feedDomId = this.feedFormData.domID;
    }
    // console.log("print line no 97 currentCompData",this.currentCompData);

    try {

      let objdetailsNew = {} = JSON.parse(this.objectDetails);
      // console.log("objdetailsNew---", objdetailsNew);
      if (objdetailsNew && objdetailsNew!.ROOT) {
        if (objdetailsNew.ROOT.Transaction != null) {
          // console.log("if condition---", objdetailsNew.ROOT.Transaction.Form);
          this.formTitle = objdetailsNew.ROOT.Transaction.Form[this.feedFormNo - 1].Title;
          // console.log("this.formTitle---", this.formTitle);
        }
      }
      // console.log("compData---", this.compData);
      this.primaryKeyField = this.allformValues["dbID"]
      this.tempData = JSON.stringify(this.feedFormData);

      if (this.feedFormData) {
        let tmpData: any = {};

        tmpData["OBJ_NAME"] = this.compData["OBJ_NAME"];
        tmpData["ACTION"] = "OBJ_METADATA";
        tmpData["FORM_NO"] = this.feedFormNo;
        tmpData["FORM_NAME"] = "";
        tmpData["PROFILEID"] = this.userInfo?.result?.UserInfo.profileId;
        tmpData["TAB_TYPE"] = "F";
        tmpData["EDITOR"] = "WebEditor";

        // console.log("tmpData---", tmpData);
        let paramString = this.feedViewService.getEncodedParamString(tmpData);
        let url =
          this.feedViewService.getHostURL() + "/ibase/RIAWizardHandlerServlet";
        this.feedViewService.isFromAttachPdf = false;
        this.feedViewService.setLoading(true);
        // console.log("url[", url, "]paramString[", paramString, "]");
        this.feedViewService.sendRequest(url, paramString, (objMetaData: any) => {
          // console.log(".. tempData---in case of objMetaData::::", objMetaData);
          this.feedViewService.setLoading(false);
          let callbackRespNew = objMetaData.split("%%SEP%%");
          objMetaData = callbackRespNew[0];
          let isError = callbackRespNew[1].trim();
          if (!(isError == "true")) {
            let metadataMap: any = {};
            const elementsStrArr: string[] = objMetaData.split("~ELEMSEP~");
            // console.log("elementsStrArr:::::::::::: 68", elementsStrArr);
            let colObjStrArr = [];
            let txtObjStrArr = [];
            let tableColObjStrArr = [];
            let groupArr = [];
            let grpObjStrArr = [];

            for (let i = 0; i < elementsStrArr.length; i++) {
              const strTok: string[] = elementsStrArr[i].split("~OBJSEP~");
              // console.log("strTok:::::::::::: 77", strTok);
              const tokenMap = parseTokens(strTok[1]);
              if (tokenMap) {
                if (strTok[0] === "ColumnObject") {
                  colObjStrArr.push(tokenMap);
                  // console.log("colObjStrArr:::::::::::: 83", colObjStrArr);
                }
                if (strTok[0] === "TextObject") {
                  txtObjStrArr.push(tokenMap);
                  // console.log("txtObjStrArr:::::::::::: 88", txtObjStrArr);
                }
                if (strTok[0] === "table_column") {
                  tableColObjStrArr.push(tokenMap);
                  // console.log(
                  // "tableColObjStrArr:::::::::::: 93",
                  // tableColObjStrArr
                  // );
                }
                if (strTok[0] === "GroupBox") {
                  groupArr.push(tokenMap);
                  // console.log("groupArr:::::::::::: 99", groupArr);
                }
                if (strTok[0] === "group") {
                  grpObjStrArr.push(tokenMap);
                  // console.log("grpObjStrArr:::::::::::: 104", grpObjStrArr);
                }
              }
              else {
                console.error("parseTokens returned undefined or encountered an error.");
              }
            }

            // console.log("colObjStrArr in feedview:::::::::::", colObjStrArr);
            metadataMap["ColumnObject"] = colObjStrArr;
            metadataMap["TextObject"] = txtObjStrArr;
            metadataMap["table_column"] = tableColObjStrArr;
            metadataMap["GroupBox"] = groupArr;
            metadataMap["group"] = grpObjStrArr;

            let yMetadataMap: Map<number, Map<number, MetaDataNodeObj>> = new Map();
            let ycolMap: Map<number, any> = new Map();

            for (let grpObjCtr = 0; groupArr !== null && grpObjCtr < groupArr.length; grpObjCtr++) {
              const grpObjMap = groupArr[grpObjCtr];
              let beanGrpObj = new MetaDataNodeObj();
              if (beanGrpObj) {
                beanGrpObj.text = grpObjMap["text"];
                beanGrpObj.xCordinate = grpObjMap["x"];
                beanGrpObj.yCordinate = grpObjMap["y"];
                beanGrpObj.height = grpObjMap["height"];
                beanGrpObj.width = grpObjMap["width"];
                beanGrpObj.name = grpObjMap["name"];
                beanGrpObj.isVisible = grpObjMap["visible"];
                beanGrpObj.mask = grpObjMap["mask"];
                beanGrpObj.initial = grpObjMap["initial"];
                beanGrpObj.type = "Group";
                // Added by Samruddhi for issue of non editable fields shown editable in edit mode
                if ("chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name || "add_term" === beanGrpObj.name) {
                  beanGrpObj.isVisible = "0";
                }
                if ("32766" === beanGrpObj.tab) {
                  beanGrpObj.disabled = true;
                }
                if (this.popHelpFieldList.includes(beanGrpObj.name)) {
                  beanGrpObj.popHelp = "true";
                }
                if (beanGrpObj.popHelp === "") {
                  const columnObjectName: string = beanGrpObj.name || "";
                  if (columnObjectName.indexOf("__") !== -1) {
                    const endIndex = columnObjectName.indexOf("__");
                    const truncatedObjectName = columnObjectName.substring(0, endIndex);
                    if (this.popHelpFieldList.includes(truncatedObjectName)) {
                      beanGrpObj.popHelp = "true";
                    }
                  }
                }
                const y = parseInt(beanGrpObj.yCordinate, 10);

                let groupBoxObj: any = {};
                groupBoxObj["grpNodeObj"] = beanGrpObj;
                yMetadataMap.set(y, groupBoxObj);
              }

            }

            for (let colObjCtr = 0; colObjCtr < colObjStrArr.length; colObjCtr++) {
              const colObjMap = colObjStrArr[colObjCtr];
              let beanGrpObj = new MetaDataNodeObj();
              if (beanGrpObj) {
                beanGrpObj.alignment = colObjMap["alignment"];
                beanGrpObj.tab = colObjMap["tabsequence"];
                beanGrpObj.xCordinate = colObjMap["x"];
                beanGrpObj.yCordinate = colObjMap["y"];
                beanGrpObj.height = colObjMap["height"];
                beanGrpObj.width = colObjMap["width"];
                beanGrpObj.format = colObjMap["format"];
                beanGrpObj.name = colObjMap["name"];
                beanGrpObj.isVisible = colObjMap["visible"];
                if (tableColObjStrArr) {
                  let tableColDataType: any;
                  tableColDataType = tableColObjStrArr.find(d => d.name === beanGrpObj.name);
                  if (tableColDataType) {
                    beanGrpObj.dataType = tableColDataType.type;
                  }
                }

                if ("chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name || "add_term" === beanGrpObj.name) {
                  beanGrpObj.isVisible = "0";
                }
                if ("32766" === beanGrpObj.tab) {
                  beanGrpObj.disabled = true;
                }

                beanGrpObj.editStyle = colObjMap["EditStyle"];
                beanGrpObj.limit = colObjMap["limit"];
                beanGrpObj.required = colObjMap["required"];
                beanGrpObj.popHelp = "";
                beanGrpObj.textCase = colObjMap["case"];
                beanGrpObj.displayLabel = colObjMap["displayLabel"];
                beanGrpObj.mask = colObjMap["mask"];
                beanGrpObj.initial = colObjMap["initial"];
                beanGrpObj.type = "Col";

                if (this.popHelpFieldList.includes(beanGrpObj.name)) {
                  beanGrpObj.popHelp = "true";
                }
                if (beanGrpObj.popHelp === "") {
                  const columnObjectName: string = beanGrpObj.name || "";
                  if (columnObjectName.indexOf("__") !== -1) {
                    const endIndex = columnObjectName.indexOf("__");
                    const truncatedObjectName = columnObjectName.substring(0, endIndex);
                    if (this.popHelpFieldList.includes(truncatedObjectName)) {
                      beanGrpObj.popHelp = "true";
                    }
                  }
                }
                const x = parseInt(beanGrpObj.xCordinate, 10);
                const y = parseInt(beanGrpObj.yCordinate, 10);

                if (yMetadataMap.get(y) != null) {
                  ycolMap = yMetadataMap.get(y)!;
                  if (beanGrpObj != null) {
                    ycolMap.set(x, beanGrpObj);
                  }
                  const ycolMapArray = Array.from(ycolMap.entries());
                  ycolMapArray.sort((a, b) => {
                    return a[0] - b[0];
                  });
                  ycolMap = new Map<number, Map<number, any>>(ycolMapArray);
                  yMetadataMap.set(y, ycolMap);

                }
                else {
                  yMetadataMap.set(y, new Map<number, any>());
                  if (beanGrpObj != null) {
                    yMetadataMap.get(y)!.set(x, beanGrpObj);
                  }

                }
              }
            }

            // console.log(" final yMetadataMap 357:::::::::;  ",yMetadataMap)
            const sortedDataMapArray = Array.from(yMetadataMap.entries());
            sortedDataMapArray.sort((a, b) => {
              return a[0] - b[0];
            });
            yMetadataMap = new Map<number, Map<number, any>>(sortedDataMapArray);
            // console.log("after sorting yMetadataMap:::: ",yMetadataMap);
            for (let tableColumnCtr = 0; tableColumnCtr < tableColObjStrArr.length; tableColumnCtr++) {
              const tableColumnMap = tableColObjStrArr[tableColumnCtr];
              let beanGrpObj = new MetaDataNodeObj();
              if (beanGrpObj) {
                beanGrpObj.name = tableColumnMap["name"];
                beanGrpObj.initial = tableColumnMap["initial"];
                beanGrpObj.type = tableColumnMap["type"];
                let options = tableColumnMap["values"];

                const resultMap = new Map();
                const values = options.split("~OPTSEP~");
                const optionValuePairs = values.map((val: any) => val.split("~OPTVALSEP~"));
                // Process the option-value pairs and store them in the Map
                for (const [value, option] of optionValuePairs) {
                  // Check if the option is not empty before adding to the map
                  //if (option && option.trim() !== "") {
                  resultMap.set(option, value);

                  //}
                }
                // Added by Samruddhi for issue of non editable fields shown editable in edit mode
                if ("chg_user" === beanGrpObj.name || "chg_term" === beanGrpObj.name || "add_date" === beanGrpObj.name || "add_user" === beanGrpObj.name || "add_term" === beanGrpObj.name) {
                  beanGrpObj.isVisible = "0";
                }
                if ("32766" === beanGrpObj.tab) {
                  beanGrpObj.disabled = true;
                }
                if (this.popHelpFieldList.includes(beanGrpObj.name)) {
                  beanGrpObj.popHelp = "true";
                }
                if (beanGrpObj.popHelp === "") {
                  const columnObjectName: string = beanGrpObj.name || "";
                  if (columnObjectName.indexOf("__") !== -1) {
                    const endIndex = columnObjectName.indexOf("__");
                    const truncatedObjectName = columnObjectName.substring(0, endIndex);
                    if (this.popHelpFieldList.includes(truncatedObjectName)) {
                      beanGrpObj.popHelp = "true";
                    }
                  }
                }
                this.optionsMap.set(beanGrpObj.name, resultMap)
              }
              // console.log(" in the tableColumnMap optionsMap ", this.optionsMap);
              // console.log(" in the tableColumnMap ", tableColumnMap);
            }
            if (txtObjStrArr !== null && txtObjStrArr !== undefined) {
              for (let textObjCtr = 0; textObjCtr < txtObjStrArr.length; textObjCtr++) {
                const txtObjMap = txtObjStrArr[textObjCtr];
                let text = txtObjMap["text"];
                let name = txtObjMap["name"]
                this.labelMapData.set(name, text);
                // console.log(" in the txtObjStrArr  name", name);
                // console.log(" in the txtObjStrArr  text", text);
                // console.log(" in the txtObjStrArr  labelMapData", this.labelMapData);
              }
            }

            let tempYCordColMap = new Map<number, Map<number, any>>();
            let currentGrpIndex: number = 0;
            let groupBoxObj: any = {};

            for (let ycordMap of yMetadataMap) {
              let yIndex = ycordMap[0];
              // console.log("yIndex ::::;", yIndex);
              if (ycordMap[1] instanceof Map) {
                tempYCordColMap.set(ycordMap[0], ycordMap[1]);
                groupBoxObj["grpBox_contents"] = tempYCordColMap;
                this.yCordGrpMap.set(currentGrpIndex, groupBoxObj);
              }
              else {
                groupBoxObj = ycordMap[1];
                tempYCordColMap = new Map<number, Map<number, any>>();
                // console.log("groupBoxObj ::::;", groupBoxObj);
                currentGrpIndex = yIndex;
                // console.log("currentGrpIndex ::::;", currentGrpIndex);
              }
            }
            // console.log(" final map ::: this.yCordGrpMap ::::; ",  this.yCordGrpMap);
          }
          this.cdr.detectChanges();
          this.setFocusOnFirstEditableField();
        });

        function parseTokens(tokenizedStr: string) {
          const tokenMap: any = {};
          //const tokenMap: { [key: string]: string | { value: string; option: string; }[] } = {};

          try {
            if (tokenizedStr) {
              const strMainTok = tokenizedStr.split("~PROPSEP~");
              for (let i = 0; i < strMainTok.length; i++) {
                const strTok = strMainTok[i].split("~PROPVALSEP~");
                const strTok0 = strTok[0];
                let strTok1 = strTok.length > 1 ? strTok[1] : "";
                tokenMap[strTok0] = strTok1;
              }
            }
          } catch (error) {
            console.error("Error parsing tokens:", error);
          }

          return tokenMap;
        }
      }
    }
    catch (error) {
      console.error("Error parsing tokens:", error);
    }
  }

  onContextMenuClick(event: any, currElemIdd?: any, isMoreButtonClick?: any) {
    // console.log('Print isMoreButtonClick inside bbfeedview ::: ', isMoreButtonClick);
    if (isMoreButtonClick == null) {
      this.createExpCollapseOverlay(event);
    }
    let grpBoxCount = document.getElementsByClassName('e12GroupBox').length;
    let currElem: any;
    if (document.getElementById(currElemIdd) != null && document.getElementById(currElemIdd)!.children[0] != null) {
      currElem = document.getElementById(currElemIdd)!.children[0];
      // console.log('Print currEleme::::: ', currElem.classList);
    }
    this.currElemId = currElemIdd
    let collapseCount = 0;
    let expandCount = 0;
    let totGrpBoxShown = 0;
    let expCollapseTemp: any = document.getElementById('bb-Feedview-ContextMenu-Active');
    if (isMoreButtonClick) {
      let elem: Element | any = document.getElementById(currElemIdd);
      if (this.isExpanded) {
        this.hideShowGroupBtnNew('CO', isMoreButtonClick);
        elem.children[0].innerHTML = 'Show More';
        elem.children[1].setAttribute('src', '/ibase/images/ExpandV.svg');
        this.isExpanded = !this.isExpanded;
      }
      else {
        this.hideShowGroupBtnNew('EX', isMoreButtonClick);
        elem.children[0].innerHTML = 'Show Less';
        elem.children[1].setAttribute('src', '/ibase/images/CollapseV.svg');
        this.isExpanded = !this.isExpanded;
      }
    }
    else {
      // console.log("inside else part:::::::")
      for (let i = 0; i < grpBoxCount; i++) {
        let grpBoxElem = document.getElementsByClassName('e12GroupBox')[i];
        // console.log("inside else part grpBoxElem:::::::",grpBoxElem)
        let styles: string | any = grpBoxElem.getAttribute('style');
        // console.log("inside else part styles:::::::",styles)
        if (styles && styles.includes('display: block')) {
          totGrpBoxShown++;
        }
        let grpBoxElemClassList = grpBoxElem.children[0].classList;
        // console.log("inside else part grpBoxElemClassList:::::::",grpBoxElemClassList)
        if (grpBoxElemClassList.contains('bb-feed-collapseGroupBox') && styles.includes('display: block')) {
          collapseCount++;
        }
        else if (grpBoxElemClassList.contains('bb-feed-expandGroupBox') && styles.includes('display: block')) {
          expandCount++;
        }
      }
      // console.log('Print line no 552::: ', currElem);
      if (currElem.classList.contains('bb-feed-collapseGroupBox')) {
        expCollapseTemp.children[0].setAttribute('style', 'display: none');
      }
      else {
        expCollapseTemp.children[1].setAttribute('style', 'display: none');
      }
      if (totGrpBoxShown == 1) {
        expCollapseTemp.children[2].setAttribute('style', 'display: none');
        expCollapseTemp.children[3].setAttribute('style', 'display: none');
      }
      else {
        if (totGrpBoxShown == collapseCount) {
          expCollapseTemp.children[2].setAttribute('style', 'display: none');
        }
        else if (totGrpBoxShown == expandCount) {
          expCollapseTemp.children[3].setAttribute('style', 'display: none');
        }
      }
    }
    // console.log('Print totGrpBoxShown line 517:: [' + totGrpBoxShown + '] collapseCount:: [' + collapseCount + '] expandCount:: [' + expandCount + ']');
  }



  hideShowGroupBtn(id: any) {
    // console.log('inside hideShowGroupBtn id :::', id);
    let elem: any = document.getElementById(id);
    // console.log('inside hideShowGroupBtn elem :::', elem);
    let grpBoxElem = elem.children[0];
    // console.log('inside hideShowGroupBtn grpBoxElem :::', grpBoxElem);
    let arrowElem
    let nextSiblingElem;

    if (grpBoxElem != null && grpBoxElem.classList.contains('bb-feed-expandGroupBox')) {
      grpBoxElem.classList.remove('bb-feed-expandGroupBox');
      grpBoxElem.classList.add('bb-feed-collapseGroupBox');
    }
    else {
      grpBoxElem.classList.remove('bb-feed-collapseGroupBox');
      grpBoxElem.classList.add('bb-feed-expandGroupBox');
    }

    arrowElem = elem.children[0].children[1];
    if (arrowElem != null && arrowElem.classList.contains('vision-ui-arrow_right')) {
      arrowElem.classList.remove('vision-ui-arrow_right');
      arrowElem.classList.add('vision-ui-arrow_down');
    }
    else {
      arrowElem.classList.remove('vision-ui-arrow_down');
      arrowElem.classList.add('vision-ui-arrow_right');
    }

    nextSiblingElem = elem.children[0].nextElementSibling;
    if (nextSiblingElem != null && nextSiblingElem.classList.contains('expandGroupBoxChild')) {
      nextSiblingElem.classList.remove('expandGroupBoxChild');
      nextSiblingElem.classList.add('collapseGroupBoxChild');
    }
    else {
      nextSiblingElem.classList.remove('collapseGroupBoxChild');
      nextSiblingElem.classList.add('expandGroupBoxChild');
    }

    if (nextSiblingElem?.classList.contains('expandGroupBoxChild')) {
      this.adjustFeedGroupBox();
    }

    if (this.groupBoxOverlay != null && this.groupBoxOverlay.hasAttached()) {
      this.groupBoxOverlay.dispose();
    }
  }

  hideShowGroupBtnNew(opt: any, isMoreButtonClick?: any) {
    let elem = document.getElementsByClassName('bbGroupBox');
    for (let i = 0; i < elem.length; i++) {
      let grpBoxElem: any = elem[i];
      let firstChildElem = grpBoxElem.children[0];
      let secndChildElem = grpBoxElem.children[1];

      if (grpBoxElem.getAttribute('style').includes('display: block') && isMoreButtonClick == null) {
        if (opt == 'EX' && firstChildElem.classList.contains('bb-feed-collapseGroupBox')) {
          // console.log('in  condition 572 ::::::');
          firstChildElem.classList.remove('bb-feed-collapseGroupBox');
          firstChildElem.classList.add('bb-feed-expandGroupBox');
          firstChildElem.children[1].classList.remove('vision-ui-arrow_right');
          firstChildElem.children[1].classList.add('vision-ui-arrow_down');
          secndChildElem.classList.remove('collapseGroupBoxChild');
          secndChildElem.classList.add('expandGroupBoxChild');
        }
        else if (opt == 'CO' && firstChildElem.classList.contains('bb-feed-expandGroupBox')) {

          firstChildElem.classList.remove('bb-feed-expandGroupBox');
          firstChildElem.classList.add('bb-feed-collapseGroupBox');
          firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
          firstChildElem.children[1].classList.add('vision-ui-arrow_right');
          secndChildElem.classList.remove('expandGroupBoxChild');
          secndChildElem.classList.add('collapseGroupBoxChild');
        }
      }
      else {
        if (opt == 'EX') {
          // console.log("print line no 576 grpBoxElem",grpBoxElem);
          if (i != 0) {
            grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: block;');
          }
          if (i != 0 && firstChildElem.classList.contains('bb-feed-expandGroupBox')) {
            grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: block;');
            firstChildElem.classList.remove('bb-feed-expandGroupBox');
            firstChildElem.classList.add('bb-feed-collapseGroupBox');
            firstChildElem.children[1].classList.remove('vision-ui-arrow_down');
            firstChildElem.children[1].classList.add('vision-ui-arrow_right');
            secndChildElem.classList.remove('expandGroupBoxChild');
            secndChildElem.classList.add('collapseGroupBoxChild');
          }
        }
        else {
          if (i != 0 && !grpBoxElem.getAttribute('style').includes('display: none')) {
            grpBoxElem.setAttribute('style', 'padding: 0px 0px 5px 0px; display: none;');

          }
        }
      }
      this.closeContextMenu();
    }
  }
  expAndCollOnOptionsClick(option: any) {
    if (option == 'E' || option == 'C') {
      this.hideShowGroupBtn(this.currElemId);
    }
    else if (option == 'EX' || option == 'CO') {
      this.hideShowGroupBtnNew(option);
    }
    this.currElemId = null;
    this.closeContextMenu();
  }

  createExpCollapseOverlay(event: any) {
    event.preventDefault();
    this.closeContextMenu();
    let menuWidth = 160;
    let menuHeight = 140;
    let vpWidth = window.innerWidth;
    let vpHeight = window.innerHeight;
    let x = event.clientX;
    let y = event.clientY;
    if (x + menuWidth > vpWidth) {
      x = x - menuWidth;
    }
    if (x < 0) { x = 8; }
    if (y + menuHeight > vpHeight) {
      y = y - menuHeight;
    }
    if (y < 0) { y = 8; }

    // Create backdrop
    this.contextBackdropEl = document.createElement('div');
    this.contextBackdropEl.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999;';
    this.contextBackdropEl.addEventListener('click', () => this.closeContextMenu());
    this.contextBackdropEl.addEventListener('contextmenu', (e) => { e.preventDefault(); this.closeContextMenu(); });
    document.body.appendChild(this.contextBackdropEl);

    // Create context menu
    let menuEl = document.getElementById('bb-Feedview-ContextMenu');
    if (menuEl) {
      this.contextMenuEl = menuEl.cloneNode(true) as HTMLElement;
    } else {
      this.contextMenuEl = document.createElement('div');
    }
    this.contextMenuEl.id = 'bb-Feedview-ContextMenu-Active';
    this.contextMenuEl.style.cssText = 'position:fixed;z-index:1000;background-color:#fff;width:160px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:block;';
    this.contextMenuEl.style.left = x + 'px';
    this.contextMenuEl.style.top = y + 'px';

    // Bind click events on cloned elements
    let spans = this.contextMenuEl.querySelectorAll('span');
    spans.forEach((span: HTMLElement) => {
      let id = span.id;
      if (id === 'collapseET') { span.onclick = () => this.expAndCollOnOptionsClick('C'); }
      else if (id === 'expandET') { span.onclick = () => this.expAndCollOnOptionsClick('E'); }
      else if (id === 'collapseAllET') { span.onclick = () => this.expAndCollOnOptionsClick('CO'); }
      else if (id === 'expandAllET') { span.onclick = () => this.expAndCollOnOptionsClick('EX'); }
    });

    document.body.appendChild(this.contextMenuEl);
    this.showContextMenu = true;
    this.cdr.detectChanges();
  }

  closeContextMenu() {
    if (this.contextMenuEl && this.contextMenuEl.parentNode) {
      this.contextMenuEl.parentNode.removeChild(this.contextMenuEl);
      this.contextMenuEl = null;
    }
    if (this.contextBackdropEl && this.contextBackdropEl.parentNode) {
      this.contextBackdropEl.parentNode.removeChild(this.contextBackdropEl);
      this.contextBackdropEl = null;
    }
    this.showContextMenu = false;
  }

  callLocalItemChange(fldName: any, fldValue: any, formNo: any, domId?: any) {
    // console.log("inside bb feed view .........39");
    let formData: any = {};
    formData["fldName"] = fldName;
    formData["fldValue"] = fldValue;
    formData["formNo"] = formNo;
    formData["index"] = this.feedIndex;
    formData["domID"] = this.feedDomId;
    if (this.feedFormData) {
      this.feedFormData[fldName] = fldValue
    }
    this.callItemchangeForFeedView.emit(JSON.stringify(formData));
    //this.feedFormData 
  }

  setFocusFormNo(feedFormNo: any, id: any, dataType?: any) {
    // console.log("on focuscuurrentFormNo[",feedFormNo,"] setFocusFormNo::id[" + id + "]");
    let formData: any = {};
    formData["formNo"] = feedFormNo;
    formData["id"] = id;
    let inputElem = document.getElementById(id);
    // console.log('print inputElem 786::::::',inputElem);
    if (inputElem) {
      // console.log('print inputId 789:::::e:',inputId);
      let iconId = id + "_Icon";
      let iconElem = document.getElementById(iconId);
      // console.log('print iconElem 3481::::::',iconElem);
      if (iconElem && iconElem.classList.contains('optionIcon')) {
        iconElem.classList.remove('optionIcon');
        iconElem.classList.add('focusOptionIcon');
        let imgElem = iconElem.getElementsByTagName('img');
        // console.log('print imgElem 3487::::::',imgElem);
        let bbType = 'text';
        if (dataType != undefined && (dataType == 'char' || dataType == 'String')) {
          bbType = 'text';
        }
        else if (dataType != undefined && (dataType == 'number' || dataType == 'decimal')) {
          bbType = 'number';
        }
        else if (dataType != undefined && (dataType == 'date' || dataType == 'Date')) {
          bbType = 'date';
        }

        let imgClass = bbType + "Icon";
        if (imgElem && imgElem[0] && imgElem[0].classList.contains(imgClass)) {
          imgElem[0].setAttribute('src', '/ibase/Insight/angplugin/assets/images/svg/' + bbType + '_simple_W.svg')
        }
      }
    }
    this.focusOnFeedView.emit(JSON.stringify(formData));
  }

  setSelectedText(event: any, id: any, dataType?: any) {
    // console.log("setSelectedText::id[" + id + "]");
    let formData: any = {};
    formData["id"] = id;
    formData['input'] = event.target as HTMLInputElement;
    let inputElem = document.getElementById(id);
    // console.log('print inputElem 826::::::',inputElem);
    if (inputElem) {
      let iconId = id + "_Icon";
      let iconElem = document.getElementById(iconId);
      // console.log('print iconElem 831::::::',iconElem);
      if (iconElem && iconElem.classList.contains('focusOptionIcon')) {
        iconElem.classList.remove('focusOptionIcon');
        iconElem.classList.add('optionIcon');
        let imgElem = iconElem.getElementsByTagName('img');
        // console.log('print imgElem 3487::::::',imgElem);
        let bbType = 'text';
        if (dataType != undefined && (dataType == 'char' || dataType == 'String')) {
          bbType = 'text';
        }
        else if (dataType != undefined && (dataType == 'number' || dataType == 'decimal')) {
          bbType = 'number';
        }
        else if (dataType != undefined && (dataType == 'date' || dataType == 'Date')) {
          bbType = 'date';
        }

        let imgClass = bbType + "Icon";
        if (imgElem && imgElem[0] && imgElem[0].classList.contains(imgClass)) {
          imgElem[0].setAttribute('src', '/ibase/Insight/angplugin/assets/images/svg/' + bbType + '_simple.svg')
        }
      }
    }
    this.blurOnFeedView.emit(JSON.stringify(formData));
  }

  onDone() {
    // console.log("inside bb feed view after done :::", this.feedFormData);
    let data: any = {};
    data["feedFormData"] = this.feedFormData;
    data["feedFormNo"] = this.feedFormNo;
    data["feedDomId"] = this.feedFormData.domID;
    // console.log("onDone ....",data);
    this.feedFormDataChanged.emit(JSON.stringify(data));
  }
  //added by mayuri for calling CANCEL action on 13 feb 2024 start
  onCancel() {
    let dataToEmit: any = {};
    // dataToEmit["data"] = JSON.parse(this.tempData);
    dataToEmit["data"] = this.tempData;
    dataToEmit["formNo"] = this.feedFormNo;
    dataToEmit["domID"] = this.feedFormData.domID;//added by mayuri on 26 feb 2024
    if (this.transMode != 'I') {
      this.tempData = JSON.parse(this.tempData)
      let forcedSave = "false";
      let pageContext = "1";
      if (this.editFlag == 'E') {
        // action = "EDIT";
        pageContext = "2";
      }
      let finalXml = "<?xml+version='1.0'+encoding='utf-8'?>"
      finalXml = finalXml + "<Root>";
      finalXml = finalXml + "<header>";
      finalXml = finalXml + "<objName><![CDATA[" + this.compData["OBJ_NAME"] + "]]></objName>";
      finalXml = finalXml + "<pageContext><![CDATA[" + pageContext + "]]></pageContext>";
      finalXml = finalXml + "<objContext><![CDATA[1]]></objContext>";
      finalXml = finalXml + "<editFlag><![CDATA[" + this.editFlag + "]]></editFlag>";
      finalXml = finalXml + "<focusedColumn><![CDATA[]]></focusedColumn>";
      finalXml = finalXml + "<elementName><![CDATA[" + false + "]]></elementName>";
      finalXml = finalXml + "<keyValue><![CDATA[1]]></keyValue>";
      finalXml = finalXml + "<taxKeyValue><![CDATA[1]]></taxKeyValue>";
      finalXml = finalXml + "<saveLevel><![CDATA[0]]></saveLevel>";
      finalXml = finalXml + "<forcedSave><![CDATA[" + forcedSave + "]]></forcedSave>";
      finalXml = finalXml + "<taxInFocus><![CDATA[false]]></taxInFocus>";
      finalXml = finalXml + "</header>";
      finalXml = this.getallFormXml(finalXml, 2);
      finalXml = finalXml + "</Root>";
      let newtempData: any = {};
      newtempData['OBJ_NAME'] = this.tempData['objName'];
      newtempData['FORM_NO'] = '2';
      newtempData['OBJ_CTX'] = '1';
      newtempData['ACTION'] = 'CANCEL';
      newtempData['EDITOR_ID'] = this.compData['EDITOR_ID'];
      newtempData['CHG_STR'] = finalXml;
      newtempData['PK_VALUES'] = this.compData['PK_VALUES'];
      newtempData['EDIT_FLAG'] = this.compData['EDIT_FLAG'];
      newtempData['EDITOR'] = this.compData['EDITOR'];
      newtempData['RTEURN_TYPE'] = "json";
      // console.log("print line no 769 newtempData",newtempData);
      let paramString = this.feedViewService.getEncodedParamString(newtempData);
      let url = this.feedViewService.getHostURL() + "/ibase/E12EditorHandlerServlet";
      this.feedViewService.isFromAttachPdf = false;
      this.feedViewService.setLoading(true);
      // console.log("url[", url, "]paramString[", paramString, "]");
      this.feedViewService.sendRequest(url, paramString, (objMetaData: any) => {
        // console.log(".. tempData---in case of objMetaData", objMetaData);
        this.feedViewService.setLoading(false);
        let callbackRespNew = objMetaData.split("%%SEP%%");
        objMetaData = callbackRespNew[0];
        // console.log("print line no 781 objMetaData",objMetaData);
        let isError = callbackRespNew[1].trim();
        if (!(isError == 'true')) {
          this.onCloseClick.emit(dataToEmit);
        }
      });
    }
    else {
      this.onCloseClick.emit(dataToEmit);
    }
  }
  getallFormXml(finalXml: any, formNo: any) {
    let formDetail = 'Detail' + formNo;
    if (formDetail == 'Detail2') {
      let sale_order = "";
      let attributeTagJson = this.tempData['attribute'];
      let attributeTagInXml = `<attribute `;
      if (attributeTagJson && typeof attributeTagJson === 'string') {
        attributeTagJson = JSON.parse(attributeTagJson);
      }
      for (const key of Object.keys(attributeTagJson)) {
        if (this.editFlag == 'E') {
          if (key == "pkNames") {
            let primaryKey = attributeTagJson[key];
            if (primaryKey != undefined) {
              let newstr = primaryKey.substring(0, primaryKey.length - 1);
              let arr = newstr.split(":");
              let arrLength = arr.length;

              for (let k = 0; k < arrLength; k++) {
                let currentPkName = arr[k];

                sale_order = sale_order + this.tempData[currentPkName] + ":";
              }
              if (sale_order != undefined) {
                sale_order = sale_order.substring(0, sale_order.length - 1);
              }
            }
          }
        }
        attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
      }
      attributeTagInXml = attributeTagInXml + `/>`;

      if (sale_order == undefined || sale_order == 'undefined') {
        sale_order = "";
      }
      let domId = this.feedFormData.domID;
      // console.log("print line no 821 domId",domId);
      let paramXML = `<` + formDetail + ` objContext="` + (1)
        + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId + `" selected="Y">`;
      paramXML = paramXML + attributeTagInXml;
      let currentAllData = JSON.parse(JSON.stringify(this.tempData));
      let jsonData: any = {};
      jsonData = JSON.parse(JSON.stringify(currentAllData));
      for (let key in jsonData) {
        let id = formDetail + '.1.' + key;
        let value = jsonData[key];
        if (value instanceof Object) {
          value = "";
        }
        if (value == "null") {
          value = "";
        }
        if (this.checkIsDateFormat(key, formNo)) {
          let fldValue = value;
          // value = "";
          if (fldValue && isNaN(fldValue.getTime())) {
            value = this.datePipe.transform(fldValue, 'dd/MM/yy');
          }
          paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
        }
        else if (key != "attribute") {
          paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
        }
      }
      paramXML = paramXML + `</` + formDetail + `>`;
      finalXml = finalXml + paramXML;
    }
    else {
      // console.log("print formno detail 2...");
      let currentAllData = JSON.parse(JSON.stringify(this.tempData));
      let detailDataLen = 0;
      if (this.tempData[formDetail] != undefined) {

        detailDataLen = this.tempData[formDetail].length;
      }
      for (let j = 0; j < detailDataLen; j++) {
        let sale_order = "";
        let attributeTagJson = this.tempData[formDetail][j]['attribute'];
        if (attributeTagJson) {
          attributeTagJson = this.tempData[formDetail][j]['attribute'];
        }
        let attributeTagInXml = `<attribute IS_CHANGE="Y"`;
        if (JSON.stringify(attributeTagJson).includes('IS_CHANGE')) {
          attributeTagInXml = `<attribute `;
        }
        if (attributeTagJson && typeof attributeTagJson === 'string') {
          attributeTagJson = JSON.parse(attributeTagJson);
        }
        for (const key of Object.keys(attributeTagJson)) {
          if (this.editFlag == 'E') {
            if (key == "pkNames") {
              let primaryKey = attributeTagJson[key];
              if (primaryKey != undefined) {
                let newstr = primaryKey.substring(0, primaryKey.length - 1);
                let arr = newstr.split(":");
                let arrLength = arr.length;
                for (let k = 0; k < arrLength; k++) {
                  let currentPkName = arr[k];
                  sale_order = sale_order + this.tempData[formDetail][j][currentPkName] + ":";
                }
                if (sale_order != undefined) {
                  sale_order = sale_order.substring(0, sale_order.length - 1);
                }
              }
            }
          }
          attributeTagInXml = attributeTagInXml + ` ` + key + `="` + attributeTagJson[key] + `"`;
        }
        attributeTagInXml = attributeTagInXml + `/>`;

        if (sale_order == undefined || sale_order == 'undefined') {
          sale_order = "";
        }
        let paramXML = "";
        if (this.editFlag == 'A') {
          let domId = this.allformValues[formDetail][j]['domID'];
          paramXML = `<` + formDetail + ` objContext="` + (1)
            + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + domId`">`;
        }
        else {
          paramXML = `<` + formDetail + ` objContext="` + (1)
            + `" objName="` + this.compData['OBJ_NAME'] + `" domID="` + (j + 1) + `" "` + `">`;
        }
        paramXML = paramXML + attributeTagInXml;
        currentAllData = this.tempData[formDetail][j];
        let jsonData: any = {};
        jsonData = JSON.parse(JSON.stringify(currentAllData));
        for (let key in jsonData) {
          let id = formDetail + '.' + (j + 1) + '.' + key;
          let value = jsonData[key];
          if (value instanceof Object) {
            value = "";
          }
          if (value == "null") {
            value = "";
          }
          if (this.checkIsDateFormat(key, formNo)) {
            let fldValue = value;
            // value = "";
            if (fldValue && !isNaN(fldValue.getTime())) {
              value = this.datePipe.transform(fldValue, 'dd/MM/yy');
            }
            paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
          }
          else if (key != "attribute") {
            paramXML = paramXML + `<` + key + `><![CDATA[` + value + `]]></` + key + `>`
          }
        }
        paramXML = paramXML + `</` + formDetail + `>`;
        finalXml = finalXml + paramXML;
      }
    }
    return finalXml;
  }
  //added by mayuri for calling CANCEL action on 13 feb 2024 end
  //added by mayuri for calling DESELECT action on 13 feb 2024 start
  deleteDetail() {
    let currentForm = 'Detail' + this.feedFormNo;
    let formSelectedData: any = {};
    let index;
    for (let i = 0; i < this.allformValues[currentForm].length; i++) {
      if (this.allformValues[currentForm][i]['domID'] == this.feedFormData['domID']) {
        index = i;
      }

    }
    formSelectedData['formDetail'] = currentForm;
    formSelectedData['formNo'] = this.feedFormNo;
    formSelectedData['index'] = index;
    this.onDelete.emit(JSON.stringify(formSelectedData));
    let dataToEmit: any = {};
    dataToEmit["data"] = this.feedFormData;
    dataToEmit["formNo"] = this.feedFormNo;
    dataToEmit["domID"] = this.feedFormData.domID;
    this.onCloseClick.emit(dataToEmit);
  }
  //added by mayuri for calling DESELECT action on 13 feb 2024 end

  openPopHelp(fldName: any, fldValue: any) {
    let pophelpData: any = {};
    pophelpData['fldName'] = fldName;
    pophelpData['fldValue'] = fldValue;
    pophelpData['formNo'] = this.feedFormNo;
    pophelpData['detailRowNo'] = this.feedIndex;
    this.onOpenPophelp.emit(JSON.stringify(pophelpData));
  }
  onItemChangeFromSuggestBox(event: any) {
    // console.log("print FEED VIEW LINE no 984 event:::::::",event);
    this.onItemChangeFromPophelp(JSON.stringify(event))
    this.itemChangeValues.emit(event);
  }

  onAutoSuggSelectedData(event: any) {
    this.autoSuggSelectedData.emit(event);
  }

  onItemChangeFromPophelp(values: any) {
    let details = JSON.parse(values);
    let itemChnageValues: any = {};
    let formNo = this.compData['OBJ_CTX'];
    try {
      if (values.indexOf('Errors') != -1) {
        this.checkError(values);
      }
      else {
        // for (let i = 0; i < formNo; i++) 
        {
          // let currFormNo = i + 1;
          let currFormNo = formNo;
          let currentFormNoDetail = 'Detail' + currFormNo;
          if (details.Root[currentFormNoDetail]) {
            // console.log('Inside Detail ', currentFormNoDetail);
            itemChnageValues = details.Root[currentFormNoDetail];

            {
              for (const key of Object.keys(itemChnageValues)) {
                // let id = this.popHelp.detailNum + '.' + this.popHelp.keyValue + '.' + key;
                if (itemChnageValues[key] && (itemChnageValues[key].content || itemChnageValues[key].content == 0)) {
                  let value = itemChnageValues[key].content;
                  this.feedFormData[key] = value;
                  // this.checkProtectAndVisbile(itemChnageValues, key, id);
                }
                else {
                  let value = itemChnageValues[key];
                  if (value instanceof Object) {
                    value = "";
                  }
                  this.feedFormData[key] = value;
                  // this.checkProtectAndVisbile(itemChnageValues, key, id);
                }
              }
            }
          }
        }
      }
    }
    catch {
      console.log('Exception inside onItemChangeFromPophelp');
    }
    // this.getMandatoryFields();
  }

  setEmitValue(event: any, fieldName: any) {
    this.feedFormData[fieldName] = event.value;
    this.onChangeValue.emit(event);
  }
  checkError(serverData: any) {
    let errorData: any[] = this.feedViewService.getErrorData(serverData);
    let msg = errorData[0] != undefined ? errorData[0] : "";
    let msgDescr = errorData[1] != undefined ? errorData[1] : "";
    let msgTrace = errorData[2] != undefined ? errorData[2] : "";
    let errMsg = this.feedViewService.getErrorMsg(msg, msgDescr, msgTrace);
    // console.log('errMsg', errMsg);
    this.feedViewService.setLoading(false);
    alert(errMsg);
  }

  formateDateFields() {
    let detailData: any = {};
    let formDetail = 'Detail' + this.feedFormNo;
    let detailLen;
    if (this.allformValues.hasOwnProperty(formDetail)) {
      detailLen = this.allformValues[formDetail].length;
      for (let j = 0; j < detailLen; j++) {
        detailData = this.allformValues[formDetail][j];
        for (let key of Object.keys(detailData)) {
          let id = formDetail + '.' + (detailData['domID']) + '.' + key;
          let value = this.allformValues[formDetail][j][key];
          if (this.checkIsDateFormat(key, this.feedFormNo)) {
            if (value) {
              if (typeof value === 'string') {
                value = this.convertStringToDate(value);
              }
              if (value && !isNaN(value.getTime())) {
                value = this.datePipe.transform(value, 'dd/MM/yy HH:mm:ss');
              }
              this.allformValues[formDetail][j][key] = value;
            }
          }
        }
      }
    }
  }

  getFirstTwoCharOfDate(dateString: any): string {
    if (dateString == undefined || dateString == null || dateString == '' || dateString == 'Invalid Date') {
      return '';
    }
    let date;
    if(dateString.includes('/'))
    {
      const parts = dateString.split(' ')[0].split('/'); // Splits the date part from the time part
      const formattedDate = `${parts[1]}/${parts[0]}/${'20' + parts[2]}`; // Convert to MM/DD/YYYY
      date = new Date(formattedDate);
    }
    else 
    {
      date = new Date(dateString);
    }
    // console.log('print date 1125:::::',date);
    const day = date.getDate().toString();
    // console.log('print day 1127:::::',day);
    return day.slice(0, 2).toUpperCase();
  }

  getMonthOfDate(dateString: any): string {
    if (dateString == undefined || dateString == null || dateString == '' || dateString == 'Invalid Date') {
      return '';
    }
    let date;
    if (dateString.includes('/')) {
      const parts = dateString.split(' ')[0].split('/'); // Splits the date part from the time part
      const formattedDate = `${parts[1]}/${parts[0]}/${'20' + parts[2]}`; // Convert to MM/DD/YYYY
      date = new Date(formattedDate);
    }
    else {
      date = new Date(dateString);
    }
    const month = date.toLocaleString('en-US', { month: 'short' }).toString()
    return month.toUpperCase();
  }

  bbDateChange(event: any) {
    let value = event.value;
    let fldValue;
    if (value) {
      fldValue = new Date(value);
      fldValue = this.datePipe.transform(fldValue, 'dd/MM/yy');
    }
    let id = event.id.split('-')
    let formNo = id[1];
    let fldName = id[2];
    this.callLocalItemChange(fldName, fldValue, formNo)
  }

  bbDateBlur(event: any) {
    let value = event.fldValue;
    let fldValue;
    if (value) {
      fldValue = new Date(value);
      fldValue = this.datePipe.transform(fldValue, 'dd/MM/yy');
    }
    let id = event.id.split('-');
    let formNo = id[1];
    let fldName = id[2];
    this.callLocalItemChange(fldName, fldValue, formNo);
  }

  getFieldNameBeforeUnderscore(fieldName: string): string {
    if (fieldName && fieldName.includes('__')) {
      return fieldName.substring(0, fieldName.indexOf('__'));
    }
    return fieldName;
  }

  bbSetFocusOnError(event: any) {
    let formNo = event.formNo
    let domID = event.domId
    let fieldName = event.fieldName
    this.setFocusOnError(formNo, domID, fieldName);
  }

  setFocusOnError(formNo: any, domID: any, fieldName: any) {
    let setFeedFocusOnErrorData: any = {}
    setFeedFocusOnErrorData['formNo'] = formNo;
    setFeedFocusOnErrorData['domId'] = domID;
    setFeedFocusOnErrorData['fieldName'] = fieldName;
    this.bbFeedSetFocusOnError.emit(setFeedFocusOnErrorData)
  }

  ngOnDestroy() {
    // document.removeEventListener('click', this.onClick);
    // document.removeEventListener('keydown', this.onKeyDown);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.viewContainerRef) {
      this.viewContainerRef.clear();
    }

  }

  checkIsDateFormat(key: any, formNo: any): boolean {
    const form = this.formWiseFormatJson[formNo];
    if (!form) {
      return false;
    }

    const format = form[key];

    if (!format) {
      return false;
    }

    const dateFormats = ['dateBox', '[shortdate] [time]', 'dd/mm/yy', 'datetime'];

    return dateFormats.includes(format);
  }

  convertStringToDate(value: string): Date {
    let newarrayDate = value.split('/');
    let newvalidDate = newarrayDate[1] + '/' + newarrayDate[0] + '/' + newarrayDate[2];
    let newDate = new Date(newvalidDate);
    return newDate;
  }

  setFocusOnFirstEditableField() {
    setTimeout(() => {
      try {
        let feedViewContainer = document.querySelector('.bbFeedViewDiv');
        if (feedViewContainer) {
          let firstEditableField = feedViewContainer.querySelector('input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])') as HTMLElement;
          if (firstEditableField) {
            firstEditableField.focus();
          }
        }
      } catch (e: any) {
        console.log('Exception in setFocusOnFirstEditableField:', e.message);
      }
    }, 300);
  }

}  