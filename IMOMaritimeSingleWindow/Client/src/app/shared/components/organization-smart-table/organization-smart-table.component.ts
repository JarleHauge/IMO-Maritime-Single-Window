import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { OrganizationButtonRowComponent } from './organization-button-row/organization-button-row.component';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organization-smart-table',
  templateUrl: './organization-smart-table.component.html',
  styleUrls: ['./organization-smart-table.component.css']
})
export class OrganizationSmartTableComponent implements OnInit {

  tableData = [];
  dataSource: LocalDataSource = new LocalDataSource();
  tableSettings = {
    mode: 'external',
    actions: false,
    attr: {
      class: 'table table-bordered'
    },
    noDataMessage: 'There are no organizations in this list.',

    columns: {
      name: {
        title: 'Name',
        type: 'html'
      },
      type: {
        title: 'Type',
        type: 'html'
      },
      organizationNumber: {
        title: 'Organization Number',
        type: 'html'
      },
      description: {
        title: 'Description',
        type: 'html'
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        filter: false,
        sort: false,
        renderComponent: OrganizationButtonRowComponent
      }
    }
  };

  constructor(
    private organizationService: OrganizationService
  ) { }

  dataRow(organization) {
    const row = {
      organizationModel: organization,
      name: organization.name,
      type: organization.organizationType.name,
      organizationNumber: organization.organizationNo || `<div class="font-italic">Not provided.</div>`,
      description: organization.description || `<div class="font-italic">Not provided.</div>`,
      actions: 'btn'
    };
    return row;
  }

  ngOnInit() {
    this.organizationService.organizationSearchData$.subscribe(data => {
      if (data) {
        if (data.length !== 0) {
          const rowList = [];
          data.forEach(organization => {
            const row = this.dataRow(organization);
            rowList.push(row);
          });
          this.tableData = rowList;
        }
      }
      this.dataSource.load(this.tableData);
    });
  }

}
