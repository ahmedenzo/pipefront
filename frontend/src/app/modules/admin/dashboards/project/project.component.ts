import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatPaginatorModule,MatPaginator} from '@angular/material/paginator';
import { ApiRequestLog } from 'app/core/Model/ApiRequestLog.model';
import { TrackingService } from 'app/core/services/tracking.service';
import { CommonModule } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';



import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
export interface PeriodicElement {

    requestBody?: string;   
    responseBody?: string;  
}




@Component({
    selector       : 'project',
    templateUrl    : './project.component.html',
    styleUrl: './project.css.component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
          state('collapsed,void', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('100ms cubic-bezier(0.6, 0.0, 0.8, 1)')),
        ]),
      ],
    standalone     : true,
    imports        : [     MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,TranslocoModule,DatePipe,CommonModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, NgIf, MatTableModule, NgClass, CurrencyPipe,MatPaginatorModule],
})
export class ProjectComponent implements OnInit, OnDestroy
{
    private _trackingService = inject(TrackingService);  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;;
    displayedColumns: string[] = ['bank', 'totalPinSend', 'totalOtpSend', 'remainingPercentage'];
    displayedColumnss: string[] = ['Agency', 'totalPinSend', 'totalOtpSend', 'remainingPercentage'];

    // Data for the table (Banks, Total Pin Send, Total OTP Send, Remaining %)
    budgetDetails = [
        { bank: 'ATB', totalPinSend: 6000, totalOtpSend: 7000, remainingPercentage: 80 },
        { bank: 'BIAT', totalPinSend: 7000, totalOtpSend: 8000, remainingPercentage: 70 },
        { bank: 'BNA', totalPinSend: 8000, totalOtpSend: 9500, remainingPercentage: 60 },
        { bank: 'STB', totalPinSend: 5000, totalOtpSend: 5200, remainingPercentage: 40 },
        { bank: 'ABC', totalPinSend: 9000, totalOtpSend: 9800, remainingPercentage: 50 }
    ];

    agencebudgetDetails = [
        { A: 'ABCcentreUrbainNord', totalPinSend: 600, totalOtpSend: 700, remainingPercentage: 80 },
        { A: 'ABCariana', totalPinSend: 700, totalOtpSend: 800, remainingPercentage: 70 },
        { A: 'ABCBizerte', totalPinSend: 800, totalOtpSend: 950, remainingPercentage: 60 },
        { A: 'ABCSousse', totalPinSend: 500, totalOtpSend: 520, remainingPercentage: 40 },
        { A: 'ABCBeja', totalPinSend: 900, totalOtpSend: 980, remainingPercentage: 50 }
    ];

    pageSize = 50; // Default page size
    totalLogs = 0; // Total number of logs
    activeSessionCount:any
    averageResponseTime:any
    showDatePicker: boolean = false;  // Controls the visibility of the date picker
    selectedDate: Date | null = null; // Holds the selected date
    errorCount: number 
    activeSessions: any = [];
    logs: ApiRequestLog[] = [];
    columnsToDisplay: string[] = [
        'timestamp',
        'username',
        'sessionId',
        'requestPath',
        'method',
        'statusCode',
   
    ];
    isSuperAdmin: boolean = false;
    isAdmin: boolean = false;
    isUser: boolean = false;
    dataSource: MatTableDataSource<ApiRequestLog>;
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    paginatorInitialized: boolean = false;
    filterUsername: string = '';
    filterDate: Date | null = null;
    expandedElement: PeriodicElement | null;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
 
    dateValue: Date | null = null;
  
    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        private cdr: ChangeDetectorRef ,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {


        this._userService.user$.subscribe(user => {
            if (user && user.roles) {
                console.log('User roles in ProjectComponent:', user.roles); // Log user roles
                this.isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN'); 
                this.isAdmin = user.roles.includes('ROLE_ADMIN'); 
                this.isUser = user.roles.includes('ROLE_USER'); 
              // Check for super admin role
           
           
      
                // Load specific data if user is Super Admin
                if (this.isSuperAdmin) {
                    this.loadErrorCount();
                    this.loadActiveSessions();
                    this.loadAverageResponseTime();
                    this.getLogs(0, this.pageSize);
                }
                 
            
            }
            
        });

        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) =>
            {
                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });
      
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void =>
                    {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
      
 
     
    }

    dateForm = new FormGroup({
        dateValue: new FormControl(null),
      });
      clearDate(): void {
        this.dateValue = null; // Clear the date value
      }
      // Method to handle date change from the date picker
      onDateChange(event: any): void {
        this.dateValue = event.value; // Update the dateValue with the selected date
      }
    loadChartDataForDate(date: string): void {
        // Use the date to fetch or filter chart data as needed
        console.log('Load data for date:', date);
        // Implement the logic to load data here
    }
    loadErrorCount(): void {
        this._trackingService.getErrorCount().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the number from the string
                const match = response.match(/(\d+)/); // This will match any sequence of digits
    
                if (match) {
                    this.errorCount = Number(match[0]); // Convert the matched string to a number
                } else {
                    console.error('No number found in response:', response);
                    this.errorCount = 0; // Handle the case where no number is found
                }
    
                console.log('Error count:', this.errorCount); // Log the final error count
            },
            (error) => {
                console.error('Error fetching error count:', error);
            }
        );
    }
    
    
    loadAverageResponseTime(): void {
        this._trackingService.getAverageResponseTime().subscribe(
            (response: string) => {
                console.log('Raw response:', response); // Log the raw response
    
                // Use a regular expression to extract the numeric part from the string
                const match = response.match(/(\d+(\.\d+)?)/); // Match digits, including decimal
    
                if (match) {
                    // Convert the matched string to a number and round to three decimal places
                    this.averageResponseTime = Number(match[0]).toFixed(3); // Keeps three decimal places
                } else {
                    console.error('No valid number found in response:', response);
                    this.averageResponseTime = '0.000'; // Handle the case where no number is found
                }
    
                console.log('Average Response Time:', this.averageResponseTime); // Log the final average response time
            },
            (error) => {
                console.error('Error fetching average response time:', error);
            }
        );
    }

      loadActiveSessions(): void {
        this._trackingService.getActiveSessions().subscribe(
          (response: any[]) => {  // Assuming the response is an array of active sessions
            this.activeSessions = response;
            this.activeSessionCount = this.activeSessions.length;  // Count the number of active sessions
            console.log('Active sessions:', this.activeSessions);
            console.log('Number of active sessions:', this.activeSessionCount);
          },
          (error) => {
            console.error('Error fetching active sessions:', error);
          }
        );
      }
      ngAfterViewInit() {
        // Ensure the paginator is correctly initialized and reacts to page changes
        if (this.paginator) {
            this.paginator.page.subscribe(() => {
                this.getLogs(this.paginator.pageIndex, this.paginator.pageSize); // Fetch new logs on page change
            });
        }
    }

    ngAfterViewChecked() {
        // Prevent multiple paginator initializations
        if (this.paginator && !this.paginatorInitialized) {
            this.paginator.page.subscribe(() => {
                this.getLogs(this.paginator.pageIndex, this.paginator.pageSize);
            });
            this.paginatorInitialized = true;
        }
    }
    getLogs(page: number, size: number): void {
        this._trackingService.getAllLogs(page, size).subscribe(
            (response: any) => {
                // Directly use the logs from the backend without sorting on the frontend.
                this.logs = response.content; // Backend should already return sorted data (most recent first)
    
                this.totalLogs = response.totalElements; // Set the total number of logs
                this.dataSource = new MatTableDataSource<ApiRequestLog>(this.logs);
                this.dataSource.paginator = this.paginator; // Assign paginator
    
                this.cdr.markForCheck(); // Manually trigger change detection
            },
            (error) => {
                console.error('Error fetching logs:', error);
            }
        );
    }
    
    
    
    
    
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) =>
            {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void
    {

        this.chartBudgetDistribution = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'radar',
                sparkline : {
                    enabled: true,
                },
            },
            colors     : ['#818CF8'],
            dataLabels : {
                enabled   : true,
                formatter : (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style     : {
                    fontSize  : '13px',
                    fontWeight: 500,
                },
                background: {
                    borderWidth: 0,
                    padding    : 4,
                },
                offsetY   : -15,
            },
            markers    : {
                strokeColors: '#818CF8',
                strokeWidth : 4,
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors   : 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.budgetDistribution.series,
            stroke     : {
                width: 2,
            },
            tooltip    : {
                theme: 'dark',
                y    : {
                    formatter: (val: number): string => `${val}%`,
                },
            },
            xaxis      : {
                labels    : {
                    show : true,
                    style: {
                        fontSize  : '12px',
                        fontWeight: '500',
                    },
                },
                categories: this.data.budgetDistribution.categories,
            },
            yaxis      : {
                max       : (max: number): number => parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7,
            },
        };
        // Github issues
        this.chartGithubIssues = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                toolbar   : {
                    show: false,
                },
                zoom      : {
                    enabled: false,
                },
            },
            colors     : ['#64748B', '#94A3B8'],
            dataLabels : {
                enabled        : true,
                enabledOnSeries: [0],
                background     : {
                    borderWidth: 0,
                },
            },
            grid       : {
                borderColor: 'var(--fuse-border)',
            },
            labels     : this.data.githubIssues.labels ,
            legend     : {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series     : this.data.githubIssues.series  ,
            states     : {
                hover: {
                    filter: {
                        type : 'darken',
                        value: 0.75,
                    },
                },
            },
            
            stroke     : {
                width: [3, 0],
            },
            tooltip    : {
                followCursor: true,
                theme       : 'dark',
            },
            xaxis      : {
                axisBorder: {
                    show: false,
                },
                axisTicks : {
                    color: 'var(--fuse-border)',
                },
                labels    : {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip   : {
                    enabled: false,
                },
            },
            yaxis      : {
                labels: {
                    offsetX: -16,
                    style  : {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };



        
        // Task distribution
        this.chartTaskDistribution = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'polarArea',
                toolbar   : {
                    show: false,
                },
                zoom      : {
                    enabled: false,
                },
            },
            labels     : this.data.taskDistribution.labels,
            legend     : {
                position: 'bottom',
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)',
                    },
                    rings : {
                        strokeColor: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.taskDistribution.series,
            states     : {
                hover: {
                    filter: {
                        type : 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke     : {
                width: 2,
            },
            theme      : {
                monochrome: {
                    enabled       : true,
                    color         : '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo       : 'dark',
                },
            },
            tooltip    : {
                followCursor: true,
                theme       : 'dark',
            },
            yaxis      : {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Budget distribution


        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#22D3EE'],
            series : this.data.weeklyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.weeklyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#4ADE80'],
            series : this.data.monthlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.monthlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#FB7185'],
            series : this.data.yearlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.yearlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };
    }
}
