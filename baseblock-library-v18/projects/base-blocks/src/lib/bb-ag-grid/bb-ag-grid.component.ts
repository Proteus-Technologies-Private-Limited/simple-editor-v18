import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { ChangeDetectorRef } from '@angular/core';
import type { PaginationNumberFormatterParams } from 'ag-grid-community'; // Column Definition Type Interface

@Component({
  selector: "bb-ag-grid",
  templateUrl: "./bb-ag-grid.component.html",
  styleUrls: ["./bb-ag-grid.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BBAgGridComponent implements OnInit {
  @Input() gridData: any = {};
  themeName: string;
  gridApi: any;
  statusBar = {
    statusPanels: [
      {
        statusPanel: "agPaginationPanel",
        align: "right",
      },
    ],
  };
  columnDefs: any = [];
  rowData: any = [];
  paginationPageSize = 25;
  paginationPageSizeSelector: number[] | boolean = [10, 50, 100,];
  @Output() onAgGridDone: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {
    this.themeName = "red-theme";
  }

  ngOnInit()
  {
    this.setGridData(this.gridData);
  }

  setGridData(gridData: any)
  {
    console.log('print gridData 40:::::::',this.gridData);
    if(gridData && gridData['CurrentFormData'] && gridData['CurrentFormData']['Root'] && gridData['CurrentFormData']['Root']['Detail'])
    {
      let detailData = gridData['CurrentFormData']['Root']['Detail'];
      if(detailData && typeof detailData == 'object' && !Array.isArray(detailData))
      {
        this.rowData[0] = {};
        let count = 0;
        for(const key of Object.keys(detailData))
        {
          this.columnDefs[count] = {};
          if(count == 0)
          {
            this.columnDefs[count]['field'] = key;
            this.columnDefs[count]['minWidth'] = 200;
            this.columnDefs[count]['checkboxSelection'] = true;
            this.columnDefs[count]['editable'] = true;
            this.columnDefs[count]['sortable'] = true;
            this.columnDefs[count]['headerCheckboxSelection'] = true;
            this.columnDefs[count]['filter'] = true;
          }
          else
          {
            this.columnDefs[count]['field'] = key;
            this.columnDefs[count]['minWidth'] = 200;
            this.columnDefs[count]['editable'] = true;
            this.columnDefs[count]['sortable'] = true;
            this.columnDefs[count]['filter'] = true;
          }
          count++;
          if(detailData[key] != undefined && detailData[key] != null)
          {
            this.rowData[0][key] = detailData[key];
          }
        }
      }
      else if(detailData && Array.isArray(detailData))
      {
        let count = 0;
        for(let i = 0; i < detailData.length; i++)
        {
          if(detailData[i])
          {
            this.rowData[i] = {};
            for(const key of Object.keys(detailData[i]))
            {
              if(i == 0)
              {
                let columnDef: any = {
                  field: key,
                  minWidth: 200,
                  editable: true,
                  sortable: true,
                  filter: true,
                };
                if(count == 0)
                {
                  columnDef['checkboxSelection'] = true;
                  columnDef['headerCheckboxSelection'] = true;
                }
                this.columnDefs.push(columnDef);
                count++;
              }
              if(detailData[i][key] != undefined && detailData[i][key] != null)
              {
                this.rowData[i][key] = detailData[i][key];
              }
            }
          }
        }
      }
      console.log('print this.columnDefs 108:::::',this.columnDefs);
      console.log('print this.rowData 109:::::',this.rowData);
    }  
  }

  setThemeName(name: any) {
    this.themeName = name;
  }

  onGridReady(params: any) {
    setTimeout(() => {
      this.gridApi = params.api;
      this.gridApi.paginationSetPageSize(this.paginationPageSize);
      params.api.sizeColumnsToFit();
      params.api.refreshCells();
      this.cdr.detectChanges();
    }, 100);
  }

  onFirstDataRendered(params: any) {
    params.api.sizeColumnsToFit();
  }
  
  getSelectedRowData() {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedRowData = selectedNodes.map((node: { data: any; }) => node.data);
    let selectedData: any = {};
    selectedData['SELECTED_ROWS'] = selectedRowData;
    if(this.gridData['FORM_NO'])
    {
      selectedData['FORM_NO'] = this.gridData['FORM_NO'];
    }
    if(this.gridData['INDEX'] != undefined && this.gridData['INDEX'] != null)
    {
      selectedData['INDEX'] = this.gridData['INDEX'];
    }
    if(this.gridData['EVENT_CODE'])
    {
      selectedData['EVENT_CODE'] = this.gridData['EVENT_CODE'];
    }
    if(this.gridData['COMP_TYPE'])
    {
      selectedData['COMP_TYPE'] = this.gridData['COMP_TYPE'];
    }
    if(this.gridData['METHOD_NAME'])
    {
      selectedData['METHOD_NAME'] = this.gridData['METHOD_NAME'];
    }
    console.log('print selectedData 157:::::', selectedData);
    this.onAgGridDone.emit(selectedData);
  }

  closeFilter(event: any)
  {
    if(event)
    {
      this.onClose.emit(event);
    }
  }

  ngOnDestroy() {
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  closeDialogAndStopEditing() {
    if (this.gridApi) {
      this.gridApi.stopEditing();
    }
    const dialog = document.getElementById('myDialog');
    if (dialog) {
        dialog.setAttribute('aria-hidden', 'true');
    }
  }

  defaultColDef = {
    flex: 1,
    minWidth: 150,
    filter: "agTextColumnFilter",
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
  };
}
