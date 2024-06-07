/**
 *  Default page code.
 */
 import {
  Grid, Page, Edit as GridEdit,
  Toolbar as GridToolbar,
  Filter as gridFilter,
  Sort as gridSort,
  Group 
} from '@syncfusion/ej2-grids';
import { CardRenderedEventArgs, Kanban } from '@syncfusion/ej2-kanban';
import { extend, addClass } from '@syncfusion/ej2-base';
import { Gantt, Edit, Selection, Toolbar, DayMarkers } from '@syncfusion/ej2-gantt';

import { DatePicker, DateRangePicker, DateTimePicker } from '@syncfusion/ej2-calendars';
import { DropDownList, DropDownTree } from '@syncfusion/ej2-dropdowns';
import {
  Schedule, Day, Week, WorkWeek, Month, Year, Agenda, TimelineViews, TimelineMonth, TimelineYear, Resize, DragAndDrop,
  ICalendarExport, ICalendarImport, Print, ExcelExport, ResourcesModel, CellClickEventArgs, Timezone
} from '@syncfusion/ej2-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
import { sprintData1, sprintData2, sprintData3 } from './dataSource';

Gantt.Inject(Edit, Selection, Toolbar, DayMarkers);
Schedule.Inject(Day, Week, WorkWeek, Month, Year, Agenda, TimelineViews, TimelineMonth, TimelineYear, DragAndDrop, Resize, ExcelExport, ICalendarExport, ICalendarImport, Print);
Grid.Inject(Page, GridEdit, GridToolbar,Group )

declare let window: any;
window.sprintData1 = sprintData1
window.sprintData2 = sprintData2
window.sprintData3 = sprintData3
window.commonData = sprintData1;
let storeScheduleEditID: any;
let gridObj: Grid;
let kanbanObj: Kanban;
let gantt: Gantt;
let scheduleObj: Schedule;
let isStatusChange:any;
let storeStatusValue: any
let datasourceDropDownwidth:any;
let timeRageWidth:any;
let resourceDropInstance: DropDownTree;
let dateRangeInstance: DateRangePicker;
let topDropDownInstance: DropDownList;
let resourceSelectValue:string|any;
let storeNewRecord : any;
const fields = { text: 'Game', value: 'Id' };
let editingResources = [
  { resourceId: 1, resourceName: 'Martin Tamer' },
  { resourceId: 2, resourceName: 'Rose Fuller' },
  { resourceId: 3, resourceName: 'Margaret Buchanan' },
  { resourceId: 4, resourceName: 'Fuller King' },
  { resourceId: 5, resourceName: 'Davolio Fuller' },
];
let priorityDataSource = [
  { name: 'Low', value: 'Low' },
  { name: 'Critical', value: 'Critical' },
  { name: 'Normal', value: 'Normal' },
  { name: 'High', value: 'High' },
];
function updateSprintData(projectValue:any, instance:any, storeNewRecord:any) {
  switch (projectValue) {
    case 'Project1':
      window.sprintData1.push(storeNewRecord)
      window.commonData = instance.dataSource
      break;
    case 'Project2':
      window.sprintData2.push(storeNewRecord)
      window.commonData = instance.dataSource
      break;
    case 'Project3':
      window.sprintData3.push(storeNewRecord)
      window.commonData = instance.dataSource
      break;
  }
}  
function updateCommonDataAndRefreshComponents(commonData: any) {
  window.commonData = commonData;
  if (kanbanObj) {
    kanbanObj.dataSource = commonData;
  }
  if (scheduleObj) {
    scheduleObj.eventSettings.dataSource = commonData;
    scheduleObj.resources[1].dataSource = commonData
  }
  if (gantt) {
    gantt.dataSource = commonData;
  }
  if (gridObj) {
    gridObj.dataSource = commonData;
  }
  setTimeout(() => {
    updateCardValue(commonData);
  }, 300);
}
const filterAndUpdateData = (projectData: any) => {
  let filteredValue: any = projectData;
  if (resourceSelectValue) {
    filteredValue = filteredValue.filter((obj: { resources:any }) => {
      return resourceSelectValue == obj.resources
    });
  }
  if (dateRangeInstance.value !== null) {
    const givenStartDate = dateRangeInstance.startDate;
    const givenEndDate = dateRangeInstance.endDate;
    filteredValue = filteredValue.filter((obj: { StartTime: string | number | Date; EndTime: string | number | Date; }) => {
      const startDate = new Date(obj.StartTime);
      const endDate = new Date(obj.EndTime);
      const givenStartDateObj = new Date(givenStartDate);
      const givenEndDateObj = new Date(givenEndDate);

      return startDate >= givenStartDateObj && endDate <= givenEndDateObj;
    });
  }
  updateCommonDataAndRefreshComponents(filteredValue);
};
function renderDataSourceDropDown(): void {
  topDropDownInstance = new DropDownList({
    dataSource: [
      { Id: 'Project1', Game: 'Project 1' },
      { Id: 'Project2', Game: 'Project 2' },
      { Id: 'Project3', Game: 'Project 3' },
    ],
    fields: fields,
    change: function (args) {
      const selectedProject = args.itemData[fields.value].toString();
      switch (selectedProject) {
        case 'Project1':
          filterAndUpdateData(window.sprintData1);
          scheduleObj.selectedDate = new Date(window.sprintData1[0].StartTime);
          break;

        case 'Project2':
          filterAndUpdateData(window.sprintData2);
          scheduleObj.selectedDate = new Date(window.sprintData2[0].StartTime);
          break;

        case 'Project3':
          filterAndUpdateData(window.sprintData3);
          scheduleObj.selectedDate = new Date(window.sprintData3[0].StartTime);
          break;
      }
    },
    placeholder: "Select a Project",
    value: 'Project1',
    width: "200px",
    popupHeight: "220px"
  })
  topDropDownInstance.appendTo("#datasourceDropDown")
}
function idExistsInArray(id: any, array: any[]) {
  return array.some(obj => obj.Id === id);
}
function renderButton(): void {
  document.getElementsByClassName('button')[0]?.addEventListener('click', () => {
    const projectValue = topDropDownInstance.value as string;
    const projectData = window[`sprintData${projectValue.charAt(projectValue.length - 1)}`];
    
    if (!projectData || projectData.length === 0) {
      // Handle the case when projectData is not defined or is an empty array
      return;
    }
    const { newId, data } = calculateIdValueAndData();
    data.Id = newId;
    let indexValue:any;
    const centeredDiv: HTMLDivElement | null = document.querySelector('.centered-div');
    if (centeredDiv) {
      let elements: any = centeredDiv.querySelectorAll('div');
      let parentDiv:any =[];
      elements.forEach(function(element:any) {
        if (element.className.includes("parent")) {
          parentDiv.push(element)
        }
      })
      elements = parentDiv
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          indexValue = index
        }
      });
    }
    switch (indexValue) {
      case 0:
        kanbanObj.openDialog("Add",data)
        break;
      case 1:
        scheduleObj.openEditor(data,"Add")
        break;
      case 2:
        gantt.openAddDialog();
        break;
      case 3:
        gridObj.editSettings.mode = "Dialog"
        gridObj.editModule.addRecord();
        break;
    }
  });
  document.getElementsByClassName('custom-div1')[0]?.addEventListener('click', () => {
    const projectValue = topDropDownInstance.value as string;
    const projectData = window[`sprintData${projectValue.charAt(projectValue.length - 1)}`];
    if (!projectData || projectData.length === 0) {
      return;
    }
    const { newId, data } = calculateIdValueAndData();
    data.Id = newId;
    let indexValue:any;
    const centeredDiv: HTMLDivElement | null = document.querySelector('.mobile-nav-bar');
    if (centeredDiv) {
      let elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
      let parentDiv:any =[];
      elements.forEach(function(element:any) {
        if (element.className.includes("parent")) {
          parentDiv.push(element)
        }
      })
      elements = parentDiv
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          indexValue = index
        }
      });
    }
    switch (indexValue) {
      case 0:
        kanbanObj.openDialog("Add",data)
        break;
      case 1:
        scheduleObj.openEditor(data,"Add")
        break;
      case 2:
        gantt.openAddDialog();
        break;
      case 3:
        gridObj.editSettings.mode = "Dialog"
        gridObj.editModule.addRecord();
        break;
    }
  })
}
const calculateIdValueAndData = () => {
  const projectValue = topDropDownInstance.value as string;
  const projectData = (window as any)[`sprintData${+projectValue.charAt(projectValue.length - 1)}`];
  if (!projectData || projectData.length === 0) {
    return { newId: undefined, data: undefined }; // Return an object with undefined values
  }
  const data = { ...projectData[0] };
  let newId = projectData.length;
  do {
    newId++;
  } while (idExistsInArray(newId, projectData));
  return { newId, data }; // Return an object with newId and data properties
}
function resourceFilterImage(value: any): void {
  const projectValue = topDropDownInstance.value;
  const dateRangeValue = dateRangeInstance.value;
  const currentData = window[`sprintData${(projectValue as string).slice(-1)}`];
  if (value) {
    const filteredData = currentData.filter((item: { resources: any; StartTime: string | number | Date; EndTime: string | number | Date; }) => {
      const resourceMatch =
        typeof value === 'string' && value &&
        item.resources === value;
      const dateMatch =
        !dateRangeValue ||
        (new Date(item.StartTime) >= dateRangeInstance.startDate &&
          new Date(item.EndTime) <= dateRangeInstance.endDate);

      return resourceMatch && dateMatch;
    });

    updateCommonDataAndRefreshComponents(filteredData);
  } else {
    updateCommonDataAndRefreshComponents(currentData);
  }
}
function timerangecompo(): void {
  dateRangeInstance = new DateRangePicker({
    change: function (args) {
      const projectValue = topDropDownInstance.value;
      const resourceValue = resourceSelectValue;
      const currentData = window[`sprintData${(projectValue as string).slice(-1)}`];
      const isDateRangeValid = args.text !== '';
      const matchedItems = currentData.filter((item: { StartTime: string | number | Date; EndTime: string | number | Date; }) => {
        const itemStartDate = new Date(item.StartTime);
        const itemEndDate = new Date(item.EndTime);

        const dateMatch =
          !isDateRangeValid ||
          (itemStartDate >= args.startDate && itemEndDate <= args.endDate);

        return dateMatch;
      });
      if (resourceValue) {
        const resourceMatchedItems = resourceValue
          ? matchedItems.filter((item: { resources: any; }) => {
            return item.resources === resourceValue;
          })
          : matchedItems;

        updateCommonDataAndRefreshComponents(resourceMatchedItems);
      } else if (!resourceValue || resourceValue.length == 0) {
        updateCommonDataAndRefreshComponents(matchedItems);
      }
    },
    width: "200px",
    startDate: new Date(2021, 0, 1),
    endDate: new Date(2021, 0, 15),
  });
  dateRangeInstance.appendTo("#timerangecompo1")
}

// grid
function resourceValueAccessor(field: any, data: any): any {
  if (data && data.resources && data.resources.length > 0) {
    const resourceName = data.resources;
    return resourceName;
  }
  return '';
}
function enddateValueAccessor(field: any, data: any): any {
  if (data && data.EndTime) {
    const originalDateString = data.EndTime
    const originalDate = new Date(originalDateString);
    const day = originalDate.getUTCDate();
    const month = originalDate.getUTCMonth() + 1;
    const year = originalDate.getUTCFullYear();
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDateString = `${formattedDay}.${formattedMonth}.${year}`;
    return formattedDateString
  }
  return '';
}
function startdateValueAccessor(field: any, data: any): any {
  if (data && data.StartTime) {
    const originalDateString = data.StartTime
    const originalDate = new Date(originalDateString);
    const day = originalDate.getUTCDate();
    const month = originalDate.getUTCMonth() + 1;
    const year = originalDate.getUTCFullYear();
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDateString = `${formattedDay}.${formattedMonth}.${year}`;
    return formattedDateString
  }
  return '';
}
const gridStatusCustomFn = (args: { [key: string]: string }) => {
  let value: any = args['value'];
  const progressElement: any = document.getElementById('component-render-gridProgress');
  if (progressElement.ej2_instances[0]) {
    if (progressElement.ej2_instances[0].value === 100 && (value === "InProgress" || value === "Testing" || value ==="Open")) {
      return false;
    } else {
      return true;
    }
  }
}
function renderGrid(): void {
  let elem: any;
  let elem3: any;
  let h4Elem:any
  let dropdownlistObj: any;
  let dropdownlistObj3: any;
  let progressValue: any;
  let status: any;
  let resource: any;
  let resourceObj: any;
  let customFn: (args: { [key: string]: string }) => any = (args: { [key: string]: string }) => {
    let value:number = parseInt(args['value'])
    const gridStatusElement:any = document.getElementById('component-render-gridStatus');
    if (gridStatusElement.ej2_instances[0]) {
      if (gridStatusElement.ej2_instances[0].value == 'Done' && value < 100) {
        return false
      } else {
        return true
      }
    }
  };
  gridObj = new Grid({
    dataSource: window.commonData,
    allowGrouping: true,
    height:"100%",
    groupSettings: { showDropArea: false,captionTemplate: '#captiontemplate', columns: ['resources'] },
    columns: [
      { field: 'Id', allowEditing: true , isPrimaryKey: true, },
      { field: 'Subject', width: '350px' },
      { field: 'StartTime', headerText:"Start Time",editType: 'datetimepickeredit',valueAccessor:startdateValueAccessor},
      { field: 'EndTime', headerText:"End Time", editType: 'datetimepickeredit',valueAccessor:enddateValueAccessor },
      {
        field: 'Progress', editType: 'numericedit', edit: {
          params: {
            min: 0,
            max: 100
          }
        }, validationRules: { required: true,minLength: [customFn, 'Progress Cant be less than 100 if the status is in Done']}
      },
      {
        field: 'Status',
        edit: {
          create: () => {
            elem = document.createElement('input');
            return elem;
          },
          read: () => {
            return dropdownlistObj.value;
          },
          destroy: () => {
            dropdownlistObj.destroy();
          },
          write: (args: any) => {
            dropdownlistObj = new DropDownList({
              dataSource: [
                { Status: 'Open' },
                { Status: 'Testing' },
                { Status: 'InProgress' },
                { Status: 'Done' },
              ],
              fields: { value: 'Status' },
              placeholder:"Status",
              value: args.rowData[args.column.field],
              floatLabelType: 'Auto',
            });
            dropdownlistObj.appendTo(elem);
          },
        }, validationRules: { required: true,minLength: [gridStatusCustomFn, 'Only Done can be selected if the progress is 100']}
      },
      {
        field: 'Priority',
        edit: {
          create: () => {
            elem3 = document.createElement('input');
            return elem3;
          },
          read: () => {
            return dropdownlistObj3.value;
          },
          destroy: () => {
            dropdownlistObj3.destroy();
          },
          write: (args: any) => {
            dropdownlistObj3 = new DropDownList({
              dataSource: [
                { Priority: 'Low' },
                { Priority: 'Normal' },
                { Priority: 'Critical' },
                { Priority: 'High' },
              ],
              fields: { value: 'Priority' },
              placeholder:"Priority",
              value: args.rowData[args.column.field],
              floatLabelType: 'Auto',
            });
            dropdownlistObj3.appendTo(elem3);
          },
        },
      },
      {
        field: 'resources',headerText:'Resources', validationRules: { required: true },
        valueAccessor: resourceValueAccessor, template: '#columnTemplateGrid',  enableGroupByFormat: true,
        edit: {
          create: () => {
            elem1 = document.createElement('input');
            return elem1;
          },
          read: () => {
            const selectedValue = dropdownlistObj1.value;
            const matchingResource = editingResources.find(
              (resource) => resource.resourceId === selectedValue
            );

            if (matchingResource) {
              return matchingResource.resourceName; // Return the matching object as an array
            }

            return null; // Return null if no matching object is found
          },
          destroy: () => {
            dropdownlistObj1.destroy();
          },
          write: (args: any) => {
            let valueToSet = args.rowData && args.rowData[args.column.field] ? args.rowData[args.column.field] : null;
            editingResources.forEach(obj => {
              if (obj.resourceName === valueToSet) {
                valueToSet = obj.resourceId
                return
              }
            });
            dropdownlistObj1 = new DropDownList({
              dataSource: editingResources,
              fields: { text: 'resourceName', value: 'resourceId' },
              value: valueToSet,
              placeholder:"Resource",
              floatLabelType: 'Auto',
            });
            dropdownlistObj1.appendTo(elem1);
          },
        }
      }
    ],
    actionBegin: function (args) {
      if (args.requestType === 'beginEdit') {
        if (args.rowData.resources) {
          resource = args.rowData.resources;
          resourceObj = args.rowData.resources;
        }
      }
      if (args.requestType === 'save') {
        if (args.data.resources) {
          args.data.resources = args.data.resources
        }
        if (!args.data.Id) {
          if (Array.isArray(gridObj.dataSource)) {
            args.data.Id = gridObj.dataSource.length + 1
          }
        }
        if (!args.data.resources) {
          args.data.resources = resourceObj;
        }
        if (args.data.Status === 'Open' && parseInt(args.data.Progress) != 0) {
          args.data.Progress = 0
        }
        if ((args.data.Status === 'InProgress' || args.data.Status === 'Testing') && (parseInt(args.data.Progress) === 0 || parseInt(args.data.Progress) === 100)) {
          args.data.Progress = 20
        }
        if (args.data.Progress === 100) {
          args.data.Status = 'Done';
        }
        if (args.data.Progress < 100 && args.data.Status == "Done") {
          args.data.Progress = 100
        }
        if (args.data.Progress != 0 && args.data.Status == "Open")  {
          args.data.Status = 'InProgress';
        }
        if (args.data.Progress == 0 && args.data.Status != "Open")  {
          args.data.Status = 'Open';
        }
        storeNewRecord = args.data
        const projectValue = topDropDownInstance.value as string | undefined;
        if (args.action == 'add') {
          updateSprintData(projectValue, gridObj, storeNewRecord);
        }
        updateDataSourceObject(
          gridObj.dataSource,
          args.data.Id,
          args.data
        );
        window.commonData = gridObj.dataSource;
        setTimeout(function() {
          gridObj.refresh();
        }, 100);
      }
    },
    dataBound:function (args) {
      updateCardValue(gridObj.dataSource)
    },
    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
    editSettings: {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      newRowPosition: 'Top',
      mode: 'Dialog'
    },
  });
  gridObj.appendTo('#component-render-grid');

}


interface TemplateFunction extends Window {
  getTags?: Function;
  getString?: Function;
  getBoolean?: Function;
  getResourceName?: Function;
  getGanttResourceImage?: Function;
  getGridResourceImage?:Function;
}

// Kanban
let isDataChanged: any;
const kanbanStatuscustomFn = (args: { [key: string]: string }): boolean | undefined => {
  let value: any = args['value'];
  const progressElement: any = document.getElementsByClassName('Progress_wrapper')[0].querySelector('input');
  if (progressElement.ej2_instances[0]) {
    if (progressElement.ej2_instances[0].value === 100 && (value === "InProgress" || value === "Testing" || value ==="Open")) {
      return false;
    } else {
      return true;
    }
  }
};
function renderKanban(): void {
  let progressValue: any;
  let status: any;
  let data: Object[] = window.commonData;
  let customFn: (args: { [key: string]: string }) => any = (args: { [key: string]: string }) => {
    let value:number = parseInt(args['value'])
    const kanbanStatusElement:any = document.getElementsByClassName('Status_wrapper')[0].querySelector('input')
    if (kanbanStatusElement.ej2_instances[0]) {
      if (kanbanStatusElement.ej2_instances[0].value == 'Done' && value < 100) {
        return false
      } else {
        return true
      }
    }
  };
  kanbanObj = new Kanban({ //Initialize Kanban control
    cssClass: "kanban-overview",
    dataSource: data,
    keyField: 'Status',
    enableTooltip: true,
    height:"100%",
    swimlaneSettings: {
      keyField: 'resources'
    },
    dialogClose: function (args) {
      if (args.requestType === 'Edit' && args.name === 'dialogClose') {
        const newProgress = parseInt(args.data.Progress);
        if (args.data.Status === 'Open' && newProgress !== 0) {
          args.data.Progress = 0
        }
        if ((args.data.Status === 'Testing' || args.data.Status === 'InProgress') && (newProgress === 0 || newProgress === 100)) {
          args.data.Progress = 20
        }
        if (newProgress !== progressValue) {
          if (newProgress === 100) {
            args.data.Status = 'Done';
          }
        }
        if (args.data.Progress != 0 && args.data.Status == "Open")  {
          args.data.Status = 'InProgress';
        }
        if (args.data.Progress == 0 && args.data.Status != "Open")  {
          args.data.Status = 'Open';
        }
        if (args.data.Status != storeStatusValue) {
          isStatusChange = true;
        }
        if (status !== newProgress && newProgress < 100 && args.data.Status === 'Done') {
          args.data.Progress = 100;
        }
        const targetId = args.data.resources;
        const matchingResource = editingResources.find(resource => resource.resourceId === targetId);
        if (matchingResource) {
          args.data.resources = matchingResource.resourceName;
        }
        isDataChanged = true;
      }
      if (args.requestType === 'Add') {
        const targetId = args.data.resources;
        const matchingResource = editingResources.find(resource => resource.resourceId === targetId);
        if (matchingResource) {
          args.data.resources = matchingResource.resourceName;
        }
        storeNewRecord = args.data
      }
    },
    dialogOpen: function (args) {
      const numericTextboxElement = document.getElementsByClassName("e-numerictextbox")[3] as HTMLElement;
      if (numericTextboxElement) {
        const ej2Instances = (numericTextboxElement as any).ej2_instances;
        ej2Instances[0].max = 100;
        ej2Instances[0].min = 0;
      }
      const fields = args.element.querySelectorAll('.e-field');
      const isCorrectFields = (
        fields[4]?.getAttribute('name') === 'StartTime' &&
        fields[5]?.getAttribute('name') === 'EndTime' &&
        fields[6]?.getAttribute('name') === 'resources' && 
        fields[7]?.getAttribute('name') === 'Priority'
      );
      if (args.data) {
        if (args.data.Status){
          if (args.requestType === 'Edit') {
            storeStatusValue = args.data.Status
          } else if (args.requestType === 'Add') {
            isStatusChange = true
          }
        }
      }
      if ((args.requestType === 'Add' || args.requestType === 'Edit') && isCorrectFields) {
        const dateTimeInstance = new DateTimePicker({
          placeholder: "Select a date and time",
          value: args.requestType === 'Edit' ? args.data.StartTime : null
        });
        dateTimeInstance.appendTo(fields[4] as HTMLInputElement);
        const dateTimeInstance1 = new DateTimePicker({
          placeholder: "Select a date and time",
          value: args.requestType === 'Edit' ? args.data.EndTime : null
        });
        dateTimeInstance1.appendTo(fields[5] as HTMLInputElement);
        let resourceObject:any= getResourceObject(args.data.resources)
        const dropDownList = new DropDownList({
          dataSource: editingResources,
          fields: { text: 'resourceName', value: 'resourceId' },
          value: args.requestType === 'Edit' ? resourceObject.resourceId : null
        });
        dropDownList.appendTo(fields[6] as HTMLInputElement);
        const dropDownList1 = new DropDownList({
          dataSource: priorityDataSource,
          fields: { text: 'name', value: 'value' },
          value: args.requestType === 'Edit' ? args.data.Priority : null
        });
        dropDownList1.appendTo(fields[7] as HTMLInputElement);
      }
      // Assign progressValue and status for 'Edit'
      if (args.requestType === 'Edit') {
        progressValue = args.data.Progress;
        status = args.data.Status;
      }
    },  
    actionBegin: function (args) {
      if (args.requestType == 'cardChange') {
        switch (args.changedRecords[0].Status) {
          case "Done":
            args.changedRecords[0].Progress = 100;
            break;
          case "Open":
            args.changedRecords[0].Progress = 0;
            break;
          default:
            args.changedRecords[0].Progress = 20;
            break;
        }
        isDataChanged = true;
        if (storeStatusValue !=args.changedRecords[0].Status) {
          isStatusChange = true;
        }
      }
    },
    cardSettings: {
      headerField: 'Id',
      template: "#cardTemplate"
    },
    actionComplete:function(args) {
    },
    dataBound: function (args) {
      if (isDataChanged) {
        const updatedData = kanbanObj.dataSource;
        window.commonData = updatedData;
        isDataChanged = false;
        if (isStatusChange) {
          updateCardValue(kanbanObj.dataSource)
          isStatusChange = false
        }
      }
      if (args.requestType == "cardCreated") {
        if (isStatusChange) {
          updateCardValue(kanbanObj.dataSource)
          const projectValue = topDropDownInstance.value;
          updateSprintData(projectValue, kanbanObj, storeNewRecord);
          isStatusChange = false
        }
      }
    },
    dialogSettings: {
      fields: [
        { key: 'Id', text: 'ID', type: 'TextBox' },
        { key: 'Subject', text: 'Subject', type: 'TextArea' },
        { key: 'Status', text: 'Status', type: 'DropDown', validationRules: { required: true, minLength: [kanbanStatuscustomFn, 'Only Done can be selected if the progress is 100'] }},
        { key: 'Progress', text: 'Progress', type: 'Numeric', validationRules: { required: true,minLength: [customFn, 'Progress Cant be less than 100 if the status is in Done']} },
        { key: 'StartTime', text: 'Start Time'},
        { key: 'EndTime', text: 'End Time' },
        { key: 'resources', text: 'Resources',validationRules:{ required: true}},
        { key: 'Priority', text: 'Priority'}
      ],
    },
    cardRendered: (args: CardRenderedEventArgs) => {
      const priority = args.data?.Priority;
      if (priority) {
        let val: string = (<{ [key: string]: Object }>(args.data)).Priority as string;
        addClass([args.element], val);
      }
    },
    columns: [
      { headerText: 'To Do', keyField: 'Open', template: '#headerTemplate' },
      { headerText: 'In Progress', keyField: 'InProgress', template: '#headerTemplate' },
      { headerText: 'Testing', keyField: 'Testing', template: '#headerTemplate' },
      { headerText: 'Done', keyField: 'Done', template: '#headerTemplate' }
    ],
  });
  kanbanObj.appendTo('#component-renderf');
}
(window as TemplateFunction).getTags = (data: string) => {
  let tagDiv: string = '';
  if (data) {
    let tags: string[] = data.split(',');
    for (let tag of tags) {
      let backgroundColor = '';
      let color = '';
      switch (tag.trim()) {
        case 'Bug':
          backgroundColor = 'rgba(255, 157, 157, 1)';
          color = 'rgba(130, 38, 38, 1)';
          break;
        case 'Customer Task':
          backgroundColor = 'rgba(213, 235, 249, 1)';
          color = 'rgba(0, 95, 156, 1)';
          break;
        case 'Internal Request':
          backgroundColor = 'rgba(229, 231, 235, 1)';
          color = 'rgba(81, 81, 81, 1)';
          break;
        case 'Release Bug':
          backgroundColor = 'rgba(251, 236, 211, 1)';
          color = 'rgba(139, 87, 0, 1)';
          break;
        case 'Breaking Issue':
          backgroundColor = 'rgba(253, 222, 221, 1)';
          color = 'rgba(170, 8, 8, 1)';
          break;
        default:
          backgroundColor = '#ffffff';
          break;
      }
      tagDiv += `<div class="e-card-tag-field e-tooltip-text" style="background-color: ${backgroundColor}; color: ${color};">${tag}</div>`;
    }
  }
  return tagDiv;
};



(window as any).getBoolean = (data: any) => {
  
  let tempDiv: string = ''
  let progressWidth: any = data.Progress + "%"
  if (data.Status != 'Open' && data.Status != 'Done') {
    tempDiv += '<div className="e-progress-bar" style="padding-left: 12px;"><div className="e-progress-bar-container"><div className="e-progress-bar-background" style="width: 100%;"><div className="e-progress-bar-progress" style="width:' + progressWidth + '; background: rgba(173, 216, 230); height: 5px;"></div><div className="e-progress-bar-text" >' + progressWidth + '</div></div></div></div>'
  }
  return tempDiv
};
(window as any).getResourceName = (data: any) => {
  if (data.resources) {
    let tempDiv: string = ''
    tempDiv += '<div class="e-card-header-title e-tooltip-text">' + data.resources + '</div>'
    return tempDiv
  }
};
(window as any).getKanbanResorurceImage = (data: any) => {
  if (data.resources) {
    let tempDiv: string = ''
    let resourceName:any = data.resources
    tempDiv += '<img className="e-card-avatar" style="width: 30px;height: 30px;text-align: center;background: gainsboro;color: #6b6b6b;border-radius: 50%;position: absolute;right: 12px;bottom: 10px;font-size: 12px;font-weight: 400;" src="//ej2.syncfusion.com/demos/src/gantt/images/'+resourceName+'.png"/>'
    return tempDiv
  }
};

(window as any).getGanttResourceImage = (data: any) => {
  let tempDiv: string = ''
  let resourceName: any = data.resources;
  if (data.resources) {
    tempDiv += '<div class="image"><img src="//ej2.syncfusion.com/demos/src/gantt/images/' + resourceName + '.png" style="height:40px;width:40px;margin-right:8px;" /><div style="display:inline-block;width:100%;position:relative;}">' + resourceName + '</div></div>'
  }
  return tempDiv
};
(window as any).getGridResourceImage = (data: any) => {
  
  let tempDiv: string = ''
  let resourceName: any = data.resources[0];
  if (data.resources) {
    tempDiv += '<div class="image"><img src="//ej2.syncfusion.com/demos/src/gantt/images/' + resourceName.resourceName + '.png" style="height:40px;width:40px;margin-right:8px;" /><div style="display:inline-block;width:100%;position:relative;}">' + resourceName.resourceName + '</div></div>'
  }
  return tempDiv
};




// Gantt
let elem: any;
let elem3: any;
let dropdownlistObj: any;
let dropdownlistObj3: any;
let elem1: any;
let dropdownlistObj1: any;
const updateDataSourceObject = (dataSource: any, id: any, updateData: any) => {
  const targetObject = dataSource.find((obj: { Id: any; }) => obj.Id === id);
  if (targetObject) {
    // Update the object with the provided data
    for (const key in updateData) {
      targetObject[key] = updateData[key];
    }
  }
};
function calculateDiff(): number {
  const element1: DOMRect = (document.getElementsByClassName("topImage")[0] as HTMLElement).getBoundingClientRect();
  const element2: DOMRect = (document.getElementsByClassName("userImage")[0] as HTMLElement).getBoundingClientRect();

  // Calculate the vertical distance between the elements
  const verticalDistance: number = Math.abs(element2.top - element1.top);
  return verticalDistance;
}
function adjustGanttHeight() {
  const viewportHeight = window.innerHeight;
  const ganttHeight = 0.5 * viewportHeight;
  const ganttBottom = gantt.element.getBoundingClientRect().bottom;
  if (ganttBottom > viewportHeight) {
      gantt.element.style.height = viewportHeight - gantt.element.offsetTop -300+ 'px';
  } else {
      gantt.element.style.height = ganttHeight + 'px';
  }
  gantt.element.style.overflow = "scroll";
  const paddingBottom = 0.17 * viewportHeight;
}

function renderGantt(): void {
  let progressValue: any;
  let isProgressResize:boolean;
  let status: any;
  registerLicense('');
  let customFn: (args: { [key: string]: string }) => any = (args: { [key: string]: string }) => {
    let value:number = parseInt(args['value'])
    const ganttStatusElement:any = document.getElementById('component-render-ganttStatus');
    if (ganttStatusElement) {
      if (ganttStatusElement.ej2_instances[0].value == "Done" && value < 100) {
        return false
      } else {
        return true
      }
    } else {
      if (status == "Done" && value < 100) {
        return false
      } else {
        return true
      }
    }
  };
  gantt = new Gantt(
    {
      dataSource: window.commonData,
      treeColumnIndex: 1,
      viewType:"ResourceView",
      collapseAllParentTasks:false,
      height:"100%",
      taskFields: {
        id: 'Id',
        name: 'Subject',
        startDate: 'StartTime',
        endDate: 'EndTime',
        duration: 'Duration',
        resourceInfo: 'resources',
        progress: 'Progress',
        dependency: 'Predecessor',
      },
      toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent'],
      columns: [
        { field: 'Id',width:'64px' },
        { field: 'Subject', width: '350px' },
        { field: 'StartTime',headerText:'Start Time' },
        { field: 'EndTime',headerText:'End Time' },
        { field: 'Progress', validationRules: { required: true,minLength: [customFn, 'Progress Cant be less than 100 if the status is in Done']} },
        {
          field: 'Status',
          edit: {
            create: () => {
              elem = document.createElement('input');
              return elem;
            },
            read: () => {
              return dropdownlistObj.value;
            },
            destroy: () => {
              dropdownlistObj.destroy();
            },
            write: (args: any) => {
              dropdownlistObj = new DropDownList({
                dataSource: [
                  { Status: 'Open' },
                  { Status: 'Testing' },
                  { Status: 'InProgress' },
                  { Status: 'Done' },
                ],
                fields: { value: 'Status' },
                value: args.rowData[args.column.field],
                floatLabelType: 'Auto',
              });
              dropdownlistObj.appendTo(elem);
            },
          },
        },
        {
          field: 'Priority',
          edit: {
            create: () => {
              elem3 = document.createElement('input');
              return elem3;
            },
            read: () => {
              return dropdownlistObj3.value;
            },
            destroy: () => {
              dropdownlistObj3.destroy();
            },
            write: (args: any) => {
              dropdownlistObj3 = new DropDownList({
                dataSource: [
                  { Priority: 'Low' },
                  { Priority: 'Critical' },
                  { Priority: 'Normal' },
                  { Priority: 'High' },
                ],
                fields: { value: 'Priority' },
                value: args.rowData[args.column.field],
                floatLabelType: 'Auto',
              });
              dropdownlistObj3.appendTo(elem3);
            },
          },
        },
        { field: 'resources', template: '#columnTemplate' },
      ],
      created:function(args) {
        
      },
      dataBound:function(args) {
        updateCardValue(gantt.dataSource)
      },
      editSettings: {
        allowAdding: true,
        allowEditing: true,
        allowDeleting: true,
        allowTaskbarEditing: true,
        mode: 'Dialog',
      },
      queryTaskbarInfo: function (args: any) {
        if (args.data.taskData.Status == 'InProgress') {
          args.progressBarBgColor = '#c9a7f4';
          args.taskbarBgColor = 'rgba(222, 204, 251, 0.6)';
          args.taskbarBorderColor = 'rgba(222, 204, 251, 1)';
        } else if (args.data.taskData.Status == 'Open') {
          args.progressBarBgColor = 'rgba(203, 228, 252, 1)';
          args.taskbarBgColor = 'rgba(203, 228, 252, 1)';
          args.taskbarBorderColor = 'rgba(203, 228, 252, 1)';
        } else if (args.data.taskData.Status == 'Done') {
          args.progressBarBgColor = 'rgba(204, 234, 189, 1)';
          args.taskbarBgColor = 'rgba(204, 234, 189, 1)';
          args.taskbarBorderColor = 'rgba(204, 234, 189, 1)';
        } else if (args.data.taskData.Status == 'Testing') {
          args.progressBarBgColor = 'rgba(254, 234, 192, 1)';
          args.taskbarBgColor = 'rgba(254, 234, 192, 0.6)';
          args.taskbarBorderColor = 'rgba(254, 234, 192, 1)';
        }
      },
      resourceFields: {
        id: 'resourceId',
        name: 'resourceName',
      },
      resources: editingResources,
      // labelSettings: {
      //   rightLabel: 'resources',
      //   taskLabel: '${Progress}%',
      // },
      actionBegin: function (args) {
        if (args.requestType === "beforeAdd" && args.data.ganttProperties.resourceInfo.length === 0) {
          args.cancel = true
          alert("Select Resource to Continue")
        }
        if (args.type == 'edit' || args.requestType == 'beforeOpenEditDialog') {
          progressValue = args.rowData.Progress;
          status = args.rowData.Status;
        } else if (args.taskBarEditAction == 'ProgressResizing') {
          progressValue = args.data.Progress;
          isProgressResize = true
        }
        if (args.requestType == 'beforeSave' || args.requestType == 'beforeAdd') {
          if (args.data.Status === 'Open' && parseInt(args.data.Progress) !== 0) {
            args.data.Progress = 0
          }
          if (progressValue != args.data.Progress) {
            if (args.data.Progress == 100) {
              args.data.Status = 'Done';
              args.data.taskData.Status = 'Done';
            }
          }
          if (args.data.Progress != 0 && args.data.Status == "Open")  {
            args.data.Status = 'InProgress';
            args.data.taskData.Status = 'InProgress';
          }
          if (args.data.Progress == 0 && args.data.Status != "Open")  {
            args.data.Status = 'Open';
            args.data.taskData.Status = 'Open';
          }
          if (status != args.data.Status) {
            if (args.data.Progress < 100 && args.data.Status == "Done" && !isProgressResize) {
              args.data.Progress = 100;
              args.data.taskData.Progress = 100;
              args.data.ganttProperties.progress = 100;
              updateDataSourceObject(
                gantt.dataSource,
                args.data.Id,
                { Progress: args.data.Progress, Status: args.data.Status }
              );
              window.commonData = gantt.dataSource;
            }
          }
          if (isProgressResize) {
            if (args.data.Progress < 100 && args.data.Status == "Done") {
              args.data.Status = 'InProgress';
              args.data.taskData.Status = 'InProgress';
            }
            isProgressResize = false;
          }
        }
        if (args.requestType == 'beforeAdd') {
          storeNewRecord = args.data
          const projectValue = topDropDownInstance.value as string | undefined;
          updateSprintData(projectValue, gantt, storeNewRecord);
        }
        if (
          args.requestType == 'beforeOpenEditDialog' ||
          args.requestType == 'beforeOpenAddDialog'
        ) {
          if (args.requestType == 'beforeOpenAddDialog') {
            const { newId, data } = calculateIdValueAndData();
            args.rowData.Id = newId
          }
          args.Resources.columns.splice(0, 1);
        }
      },
      actionComplete: function (args) {
        if (
          args.requestType == 'openEditDialog' ||
          args.requestType == 'openAddDialog'
        ) {
          let resources: any = args.data.ganttProperties.resourceInfo;
          let tabObj: any = (document.getElementById(gantt.element.id+'_Tab') as any)['ej2_instances'][0];
          tabObj.selected = function (args: any) {
            if (args.selectedIndex == 2) {
              let gridObj: any = (document.getElementById(gantt.element.id+'ResourcesTabContainer_gridcontrol') as any)['ej2_instances'][0];
              gridObj.selectionSettings = {
                checkboxOnly: false,
                type: 'Single',
                persistSelection: false,
              };
              let currentViewData: any = gridObj.getCurrentViewRecords();
              let indexs: any = [];
              if (resources && resources.length > 0) {
                currentViewData.forEach(function (data: any, index: any) {
                  for (let i = 0; i < resources.length; i++) {
                    if (
                      data.taskData['resourceId'] ===
                      resources[i]['resourceId'] &&
                      gridObj.selectionModule &&
                      gridObj.getSelectedRowIndexes().indexOf(index) === -1
                    ) {
                      indexs.push(index);
                    }
                  }
                  gridObj.selectRows(indexs);
                });
              }
            }
          };
        }
        if (args.requestType == "save" ||args.requestType == "add"||args.requestType == "delete") {
          if (args.requestType == "delete") {
            let dataSourceArray = gantt.dataSource as any[];
            let storeArgs = args;
            let newArray = dataSourceArray.filter(function (item: any) {
              return item.Id !== storeArgs.data[0].Id;
            });
            gantt.dataSource = newArray
            window.commonData = gantt.dataSource
            gridObj.dataSource =window.commonData
            scheduleObj.eventSettings.dataSource = window.commonData;
            scheduleObj.resources[1].dataSource = window.commonData;
            kanbanObj.dataSource = window.commonData;
          }
          updateCardValue(gantt.dataSource)
        }
      },
      rowHeight: 60,
    });
  gantt.appendTo('#component-render-gantt');
  
}
// Scheduler 
const applyCategoryColor = (args: any, currentView: any) => {

  if (!args.element) {
    return;
  }

  if (args.data.Status === 'Done') {
    args.element.style.backgroundColor = 'rgba(204, 234, 189, 1)';
    args.element.style.color = 'rgba(38, 38, 38, 1)'
  } else if (args.data.Status === 'Open') {
    args.element.style.backgroundColor = 'rgba(203, 228, 252, 1)';
    args.element.style.color = 'rgba(38, 38, 38, 1)'
  } else if (args.data.Status === 'InProgress') {
    args.element.style.backgroundColor = 'rgba(222, 204, 251, 1)';
    args.element.style.color = 'rgba(38, 38, 38, 1)'
  } else if (args.data.Status === 'Testing') {
    args.element.style.backgroundColor = 'rgba(254, 234, 192, 1)';
    args.element.style.color = 'rgba(38, 38, 38, 1)'
  }

};
function renderScheduler(): void {
  let progressValue: any;
  let status: any;
  let dropDownList: any;
  scheduleObj = new Schedule({
    height: '100%',
    showQuickInfo:false,
    selectedDate: new Date(2021, 0, 1),
    eventSettings: { dataSource: window.commonData },
    popupOpen: function (args) {  
      if (args.type === 'Editor') {
        storeScheduleEditID = args.data.Id
        progressValue = args.data.Progress;
        status = args.data.Status
        // Create required custom elements in initial time
        let formElement = args.element.querySelector('.e-schedule-form');
        if (formElement && !formElement.querySelector('.custom-field-row')) {
          let row = document.createElement('div');
          row.className = 'custom-field-row';

          // Create a label for the input element
          let label = document.createElement('label');
          label.textContent = 'Status';

          // Remove font-weight styles from the label
          label.style.fontWeight = 'normal'; // Or 'unset'

          let container = document.createElement('div');
          container.className = 'custom-field-container';

          let inputEle = document.createElement('input');
          inputEle.className = 'e-field';
          inputEle.name = 'Status';

          container.appendChild(inputEle);
          row.appendChild(label); // Append the label
          row.appendChild(container);
          let errorMessage = document.createElement('span');
          errorMessage.className = 'error-message';
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'none';
          errorMessage.textContent = 'Only Done can be selected if the progress is 100';
          row.appendChild(errorMessage);
          formElement.insertBefore(row, formElement.firstChild);
          const buttonElement = document.querySelector('.e-schedule-dialog.e-control.e-btn.e-lib.e-primary.e-event-save.e-flat') as HTMLButtonElement;
          let dropDownList = new DropDownList({
            dataSource: [
              { text: 'Open', value: 'Open' },
              { text: 'Testing', value: 'Testing' },
              { text: 'InProgress', value: 'InProgress' },
              { text: 'Done', value: 'Done' },
            ],
            fields: { text: 'text', value: 'value' },
            change:function(args) {
              let targetElement: any | null = document.getElementsByClassName("e-field")[0];
              if (args.value != 'Done' && parseInt(targetElement.value) === 100) {
                errorMessage.style.display = 'block'; 
                buttonElement.disabled = true;
                return
              } else {
                errorMessage.style.display = 'none';
                buttonElement.disabled = false; 
              }
              if (targetElement && targetElement.name == 'Progress') {
                const event = new Event('focusout', { bubbles: true });
                targetElement.dispatchEvent(event);
              }
            },
            value: args.data.Status,
          });

          dropDownList.appendTo(inputEle);
        }
        if (formElement && !formElement.querySelector('.custom-field-row-priority')) {
          let row = document.createElement('div');
          row.className = 'custom-field-row-priority';

          // Create a label for the input element
          let label = document.createElement('label');
          label.textContent = 'Priority';

          // Remove font-weight styles from the label
          label.style.fontWeight = 'normal'; // Or 'unset'

          let container = document.createElement('div');
          container.className = 'custom-field-priority';

          let inputEle = document.createElement('input');
          inputEle.className = 'e-field';
          inputEle.name = 'Priority';

          container.appendChild(inputEle);
          row.appendChild(label); // Append the label
          row.appendChild(container);

          formElement.insertBefore(row, formElement.firstChild);

          let dropDownList = new DropDownList({
            dataSource: [
              { text: 'Low', value: 'Low' },
              { text: 'Normal', value: 'Normal' },
              { text: 'Critical', value: 'Critical' },
              { text: 'High', value: 'High' },
            ],
            fields: { text: 'text', value: 'value' },
            value: args.data.Priority,
          });

          dropDownList.appendTo(inputEle);
        }
        if (
          formElement &&
          !formElement.querySelector('.custom-field-row-progress')
        ) {
          let row = document.createElement('div');
          row.className = 'custom-field-row-progress';
          row.style.paddingBottom = '10px';

          // Create a label for the header text
          let headerLabel = document.createElement('label');
          headerLabel.textContent = 'Progress';

          // Remove font-weight styles from the label
          headerLabel.style.fontWeight = 'normal'; // Or 'unset'

          let container = document.createElement('div');
          container.className = 'custom-field-progress';

          let inputEle = document.createElement('input');
          inputEle.className = 'e-field';
          inputEle.name = 'Progress';

          // Set the type to "number" to create a numeric input
          inputEle.type = 'number';
          inputEle.style.width = '100%';
          inputEle.max = "100";
          inputEle.min="0";
          let errorMessage = document.createElement('span');
          errorMessage.className = 'error-message';
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'none'; // Initially hide the error message
          inputEle.addEventListener('focusout', function (event) {
            const schedulerStatusElement:any =document.getElementsByClassName('custom-field-row')[0].querySelector('input')
            const buttonElement = document.querySelector('.e-schedule-dialog.e-control.e-btn.e-lib.e-primary.e-event-save.e-flat') as HTMLButtonElement;
            let enteredValue = parseInt(inputEle.value, 10);
            if (enteredValue < 0) {
              inputEle.value = '0'; // Set value as string '0'
            }
            if (enteredValue > 100) {
              inputEle.value = '100';
            }
            if (schedulerStatusElement.ej2_instances[0].value == "Done" && enteredValue < 100) {
              errorMessage.textContent = 'Progress Cant be less than 100 if the status is in Done';
              errorMessage.style.display = 'block';
              (event.currentTarget as HTMLElement).style.borderColor = 'red';
              buttonElement.disabled = true;
            } else {
              errorMessage.style.display = 'none'; 
              (event.currentTarget as HTMLElement).style.borderColor = '';
              buttonElement.disabled = false;
            }
          });
          inputEle.value = args.data.Progress;
          container.appendChild(inputEle);
          row.appendChild(headerLabel);
          row.appendChild(container);
          row.appendChild(errorMessage); 
          formElement.insertBefore(row, formElement.firstChild);
        }
      }
    },
    currentView: 'TimelineMonth',
    eventRendered: function (args) {
      applyCategoryColor(args, scheduleObj.currentView);
    },
    actionBegin: function (args) {
      if (args.requestType == 'eventCreate') {
        
        if (args.data[0].resources) {
          const foundObject:any = editingResources.find(obj => obj.resourceName === args.data[0].resources);
          args.data[0].resources = foundObject.resourceName
        }
      }
      if (args.requestType == 'eventChange') {
        if (args.data.resources) {
          const foundObject:any = editingResources.find(obj => obj.resourceName === args.data.resources);
          args.data.resources = foundObject.resourceName
        }
        if (progressValue != parseInt(args.data.Progress)) {
          if (args.data.Progress == 100) {
            args.data.Status = 'Done';
          }
        }
        if (status != args.data.Status) {
          if (args.data.Progress < 100 && args.data.Status == "Done") {
            args.data.Progress = 100
          }
        }
        if (args.data.Progress != 0 && args.data.Status == "Open")  {
          args.data.Status = 'InProgress';
        }
        if (args.data.Progress == 0 && args.data.Status != "Open")  {
          args.data.Status = 'Open';
        }
        if (Array.isArray(scheduleObj.eventSettings.dataSource)) {
          const dataSource = scheduleObj.eventSettings.dataSource;
          const idToMatch = storeScheduleEditID;
          dataSource.forEach(item => {
            if (item.Id === idToMatch) {
              item = args.data;
              item.Id = idToMatch;
              return
            }
          });
        }
      }
    },
    actionComplete: function (args) {
      if (args.requestType != 'toolBarItemRendered') {
        setTimeout(() => {
          scheduleObj.refresh();
        }, 0);
      }
    },
    dataBound:function (args) {
      updateCardValue(scheduleObj.eventSettings.dataSource)
    },
    group: {
      resources: ['Projects', 'Categories'],
    },
    resources: [
      {
        field: 'resources',
        title: 'Resources',
        name: 'Projects',
        dataSource: editingResources,
        textField: 'resourceName',
        idField: 'resourceName',
      },
      {
        field: 'Id',
        title: 'Category',
        name: 'Categories',
      //  allowMultiple: true,
        dataSource: window.commonData,
        textField: 'Subject',
        idField: 'Id',
        groupIDField: 'resources',
      },
    ],
    views: [
      'TimelineDay',
      'TimelineWeek',
      'TimelineWorkWeek',
      'TimelineMonth',
      'Agenda',
    ],
  });
  scheduleObj.appendTo("#component-render-scheduler")
}
function updateCardValue(passedData?:any): void {
  const projectValue = topDropDownInstance.value;
  const dateRangeValue = dateRangeInstance.value;
  const currentData = passedData?passedData: window[`sprintData${(projectValue as string).slice(-1)}`];

  // Define type for counts
  type Counts = { InProgress: number; Testing: number; Open: number; Done: number };

  const counts: Counts = {
    InProgress: 0,
    Testing: 0,
    Open: 0,
    Done: 0,
  };

  currentData.forEach((item: { Status: keyof Counts }) => {
    counts[item.Status]++;
  });

  updateCardElement('.detailcontainertodo', counts.Open,0);
  updateCardElement('.detailcontainertodo', counts.InProgress,1);
  updateCardElement('.detailcontainertodo', counts.Testing,2);
  updateCardElement('.detailcontainertodo', counts.Done,3);
}
function updateCardElement(selector: string, count: number,indexNumber:number): void {
  const cardElement = document.querySelectorAll(selector)[indexNumber];
  const countTodoElement = cardElement?.querySelector('.counttodo');
  if (countTodoElement) {
    countTodoElement.innerHTML = count.toString();
  }
}
function bindClickEvent(): void {
  let anchorTags: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('body a');
  if (anchorTags) {
    for (let i = 0; i < anchorTags.length; i++) {
      let currentAnchor = anchorTags[i];
      if (currentAnchor) {
        if (currentAnchor.textContent && currentAnchor.textContent.trim() === 'Claim your free account') {
          let parentElement: Element | null = currentAnchor.parentElement;
          if (parentElement) {
            parentElement.remove()
          }
        }
      }
    }
  }
  const imageContainer: HTMLElement | null = document.getElementById('image-container') as HTMLElement;
  if (imageContainer) {
    const circularImages: NodeListOf<HTMLElement> = imageContainer.querySelectorAll('.circular-image');
    circularImages.forEach((image: HTMLElement) => {
      image.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLImageElement;
        if (target.tagName === 'IMG') {
          let altText:any = target.alt;
          if (altText) {
            if (resourceSelectValue == altText) {
              altText = null
            }
            resourceSelectValue = altText
            resourceFilterImage(altText);
            if (target.classList.contains('selected-image')) {
              target.classList.remove('selected-image');
            } else {
              circularImages.forEach(img => {
                img.classList.remove('selected-image');
              });

              // Add box shadow to the clicked image
              target.classList.add('selected-image');
            }
          }
        }
      });
    });
  }
}
function bindTabClickEvent(): void {
  const kanban = document.getElementById("component-renderf") as HTMLElement;
  const scheduler = document.getElementById("component-render-scheduler") as HTMLElement;
  const gantt1 = document.getElementById("component-render-gantt") as HTMLElement;
  const grid = document.getElementById("component-render-grid") as HTMLElement;
  kanban.classList.add("show1")
  const setActiveTab = (activeTab: HTMLElement, backgroundClass: string): void => {
    const elements = [
      document.getElementsByClassName("parent-kanban")[0],
      document.getElementsByClassName("parent-scheduler")[0],
      document.getElementsByClassName("parent-gantt")[0],
      document.getElementsByClassName("parent-grid")[0]
    ];
    elements.forEach(element => {
      if (element) {
        element.classList.remove("show1-background");
      }
    });
    if (activeTab) {
      activeTab.classList.add("show1-background");
    }
    [kanban, scheduler, gantt1, grid].forEach(component => {
      if (component) {
        component.classList.remove("show1");
      }
    });
    if (activeTab === document.getElementsByClassName("parent-kanban")[0]) {
      kanban?.classList.add("show1");
      kanbanObj.refresh();
    } else if (activeTab === document.getElementsByClassName("parent-scheduler")[0]) {
      scheduler?.classList.add("show1");
      scheduleObj.refresh();
    } else if (activeTab === document.getElementsByClassName("parent-gantt")[0]) {
      gantt1?.classList.add("show1");
      setTimeout(() => {
        gantt.refresh();
      }, 0);
    } else if (activeTab === document.getElementsByClassName("parent-grid")[0]) {
      grid?.classList.add("show1");
      gridObj.refresh();
    }
  };
  setActiveTab(document.getElementsByClassName("parent-kanban")[0] as HTMLElement, "show1-background");
  const parentElement = document.getElementsByClassName("centered-div")[0] as HTMLElement;
  parentElement?.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      element.addEventListener("click", (e: any) => {
        if (e.target.classList.contains("navimage-kanban") || e.target.classList.contains("parent-kanban")) {
          setActiveTab(document.getElementsByClassName("parent-kanban")[0] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-scheduler") || e.target.classList.contains("parent-scheduler")) {
          setActiveTab(document.getElementsByClassName("parent-scheduler")[0] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-gantt") || e.target.classList.contains("parent-gantt")) {
          setActiveTab(document.getElementsByClassName("parent-gantt")[0] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-grid") || e.target.classList.contains("parent-grid")) {
          setActiveTab(document.getElementsByClassName("parent-grid")[0] as HTMLElement, "show1-background");
        }
      });
    }
  });
}
function bindEventListeners(): void {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const clickOrTouchEvent = isTouchDevice ? 'touchstart' : 'click';
  const kanban = document.getElementById("component-renderf") as HTMLElement;
  const scheduler = document.getElementById("component-render-scheduler") as HTMLElement;
  const gantt1 = document.getElementById("component-render-gantt") as HTMLElement;
  const grid = document.getElementById("component-render-grid") as HTMLElement;
  kanban.classList.add("show1");
  const setActiveTab = (activeTab: HTMLElement, backgroundClass: string): void => {
    const elements = [
      document.getElementsByClassName("parent-kanban")[1],
      document.getElementsByClassName("parent-scheduler")[1],
      document.getElementsByClassName("parent-gantt")[1],
      document.getElementsByClassName("parent-grid")[1]
    ];
    elements.forEach(element => {
      if (element) {
        element.classList.remove("show1-background");
      }
    });
    if (activeTab) {
      activeTab.classList.add("show1-background");
    }
    [kanban, scheduler, gantt1, grid].forEach(component => {
      if (component) {
        component.classList.remove("show1");
      }
    });
    if (activeTab === document.getElementsByClassName("parent-kanban")[1]) {
      kanban?.classList.add("show1");
      scheduleObj.refresh();
      kanbanObj.refresh();
    } else if (activeTab === document.getElementsByClassName("parent-scheduler")[1]) {
      scheduler?.classList.add("show1");
      kanbanObj.refresh();
      scheduleObj.refresh();
    } else if (activeTab === document.getElementsByClassName("parent-gantt")[1]) {
      gantt1?.classList.add("show1");
      scheduleObj.refresh();
      kanbanObj.refresh();
      setTimeout(() => {
        gantt.refresh();
      }, 0);
    } else if (activeTab === document.getElementsByClassName("parent-grid")[1]) {
      grid?.classList.add("show1");
      scheduleObj.refresh();
      kanbanObj.refresh();
      gantt.refresh();
      gridObj.refresh();
    }
  };
  const parentElement = document.getElementsByClassName("mobile-nav-bar")[0] as HTMLElement;
  parentElement?.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      element.addEventListener(clickOrTouchEvent, (e: any) => {
        if (e.target.classList.contains("navimage-kanban") || e.target.classList.contains("parent-kanban")) {
          setActiveTab(document.getElementsByClassName("parent-kanban")[1] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-scheduler") || e.target.classList.contains("parent-scheduler")) {
          setActiveTab(document.getElementsByClassName("parent-scheduler")[1] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-gantt") || e.target.classList.contains("parent-gantt")) {
          setActiveTab(document.getElementsByClassName("parent-gantt")[1] as HTMLElement, "show1-background");
        } else if (e.target.classList.contains("navimage-grid") || e.target.classList.contains("parent-grid")) {
          setActiveTab(document.getElementsByClassName("parent-grid")[1] as HTMLElement, "show1-background");
        }
      });
    }
  });
}
function adjustElementHeight() {
  const element = document.getElementsByClassName('main-content')[0] as HTMLElement;
  const elementHeight = element.clientHeight -
    parseFloat(getComputedStyle(element).paddingTop) -
    parseFloat(getComputedStyle(element).paddingBottom) -
    parseFloat(getComputedStyle(element).marginTop) -
    parseFloat(getComputedStyle(element).marginBottom);
  const filterHeight = document.getElementsByClassName('datasource-filter-container')[0].getBoundingClientRect().height;
  const titleHeight = document.getElementsByClassName('title-container')[0].getBoundingClientRect().height;
  const changeElement = document.getElementsByClassName('component-contain')[0] as HTMLElement;
  const desiredHeight = elementHeight - (filterHeight + titleHeight);
  changeElement.style.height = (desiredHeight -10)+ 'px';
  const elementGrid = document.getElementById('component-render-grid');
    if (elementGrid) {
      if ((desiredHeight - 87.5) > 549 && (desiredHeight - 87.5) < 1433) {
        elementGrid.style.height = (desiredHeight - 89) + 'px';
      } else if ((desiredHeight - 87.5) > 1433) {
        elementGrid.style.height = (desiredHeight - 94) + 'px';
      } else {
        elementGrid.style.height = (desiredHeight - 87.5) + 'px';
      }
    }
}
window.addEventListener('resize', function() {
  if (window.innerWidth < 500) {
    document.getElementsByClassName('component-contain')[0].classList.remove('add-overflow');
  } else {
    document.getElementsByClassName('component-contain')[0].classList.add('add-overflow');
    adjustElementHeight()
  }
  if (window.innerWidth >= 700) {
    const centeredDiv: HTMLDivElement | null = document.querySelector('.mobile-nav-bar');
    let storedClassName:any;
    if (centeredDiv) {
      const elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          storedClassName = element.classList[0]
          element.classList.remove('show1-background')
        }
      });
      if (storedClassName) {
        document.getElementsByClassName(storedClassName)[0].classList.add("show1-background");
      }
    }
  } else {
    const centeredDiv: HTMLDivElement | null = document.querySelector('.centered-div');
    let storedClassName:any;
    if (centeredDiv) {
      const elements: NodeListOf<HTMLDivElement> = centeredDiv.querySelectorAll('div');
      elements.forEach(function (element: HTMLDivElement, index: number) {
        if (element.classList.contains('show1-background')) {
          storedClassName = element.classList[0]
          element.classList.remove('show1-background')
        }
      });
      if (storedClassName) {

        document.getElementsByClassName(storedClassName)[1].classList.add("show1-background");
      }
    }
  }
});
window.addEventListener('load', function () {
  const componentContainElements = document.getElementsByClassName('component-contain') as HTMLCollectionOf<HTMLElement>;
  if (componentContainElements.length > 0) {
    if (window.innerWidth < 500) {
      componentContainElements[0].classList.remove('add-overflow');
    } else {
      componentContainElements[0].classList.add('add-overflow');
      adjustElementHeight()
    }
  }
  const parentKanbanElements = document.getElementsByClassName('parent-kanban') as HTMLCollectionOf<HTMLElement>;
  if (parentKanbanElements.length > 1) {
    if (window.innerWidth < 380) {
      parentKanbanElements[1].classList.add('show1-background');
    }
  }
});
function bindScrollEvent(): void { 
  let createContainer: Element | null = document.querySelector('.create-container');
  if (createContainer !== null) {
    createContainer.addEventListener('scroll', function (event) {
      if (event.currentTarget instanceof HTMLElement) {
        if (event.currentTarget.scrollTop > 110) {
          let datasourceFilter: Element | undefined = document.getElementsByClassName('datasource-filter-container')[0];
          if (datasourceFilter instanceof HTMLElement) {
            datasourceFilter.style.visibility = "hidden";
          }
        } else {
          let datasourceFilter: HTMLElement = document.getElementsByClassName('datasource-filter-container')[0] as HTMLElement;
          if (datasourceFilter instanceof HTMLElement) {
            datasourceFilter.style.visibility = "";
          }
        }
      }
    });
  }
}
window.home = () => {
  renderDataSourceDropDown();
  renderButton();
  timerangecompo();
  renderGrid();
  renderKanban();
  renderGantt();
  renderScheduler();
  updateCardValue();
  bindClickEvent();
  bindTabClickEvent();
  bindEventListeners();
  bindScrollEvent();
  adjustElementHeight()
};
function getResourceObject(resourceStr:any) {
  return editingResources.find(resource => resource.resourceName === resourceStr);
}
