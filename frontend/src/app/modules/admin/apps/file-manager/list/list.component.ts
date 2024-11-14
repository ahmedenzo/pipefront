import { NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardHolderLoadReport } from 'app/core/Model/file.model';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TabCardHolderService } from 'app/core/services/fileupload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        AsyncPipe,
        RouterOutlet,
        RouterLink,
        FuseAlertComponent,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatProgressBarModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
})
export class FileManagerListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    uploadProgress: number = 0;
    isUploading: boolean = false;
    loadReports: CardHolderLoadReport[] = [];
    private _fuseAlertService = inject(FuseAlertService);
    dataSource: MatTableDataSource<CardHolderLoadReport>;
    displayedColumns: string[] = ['fileName', 'loadDate', 'createdCount', 'updatedCount', 'status'];

    errorMessage: string | null = null;
    successMessage: string | null = null;
    items: { folders: any[]; files: any[]; path: any[] } = { folders: [], files: [], path: [] };

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileuploadService: TabCardHolderService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {}

    ngOnInit(): void {
        console.log('ngOnInit called, initializing data source');
    
        // Initialize dataSource without data
        this.dataSource = new MatTableDataSource([]);
    
        // Fetch load reports and assign them to the table data source
  this.getallreport()
    }
    
    ngAfterViewInit(): void {
        console.log('ngAfterViewInit called, assigning paginator and sort');
    
        // Ensure paginator and sort are initialized properly after view is ready
        this.dataSource.paginator = this._paginator;
        this.dataSource.sort = this._sort;
    
        console.log('Paginator and sort confirmed after view init:', this._paginator, this._sort);  // Debugging log for paginator and sort after view init
    
        // Ensure the change detection cycle catches this update
        this._changeDetectorRef.detectChanges();
    }
    
    
    ngOnDestroy(): void {
        console.log('ngOnDestroy called, cleaning up');
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    onFileSelected(event: any): void {
        const fileInput = event.target; // Capture the input element
        const file: File = fileInput.files[0];
        if (file) {
            this.isUploading = true;
            this.uploadProgress = 0;
            this.successMessage = null;
            this.errorMessage = null;
    
            this._fileuploadService.uploadFile(file).pipe(
                takeUntil(this._unsubscribeAll)
            ).subscribe({
                next: (event: HttpEvent<any>) => {
                    switch (event.type) {
                        case HttpEventType.UploadProgress:
                            if (event.total) {
                                this.uploadProgress = Math.round(100 * event.loaded / event.total);  // Update progress
                                this._changeDetectorRef.markForCheck();  // Trigger UI update
                            }
                            break;
                        case HttpEventType.Response:
                            this.isUploading = false;
                            this.uploadProgress = 100;  // Mark as complete
                            this.successMessage = event.body;  // Show the server's success message
                            this._changeDetectorRef.markForCheck();
    
                            // Optionally refresh the load reports
                            this.getallreport()
                            // Hide success message after 2 seconds
                            setTimeout(() => {
                                this.successMessage = null;
                                this._changeDetectorRef.markForCheck();  // Ensure UI update
                            }, 4000);
    
                            // Reset the file input element after a successful upload
                            fileInput.value = ''; // This allows the same file to be selected again
                            break;
                    }
                },
                error: (error) => {
                    this.isUploading = false;
                    this.errorMessage = `Error uploading file: ${error.message}`;
                    this._changeDetectorRef.markForCheck();
    
                    // Clear file input after an error
                    fileInput.value = ''; // Allow re-selection of the same file
    
                    // Hide error message after 4 seconds
                    setTimeout(() => {
                        this.errorMessage = null;
                        this._changeDetectorRef.markForCheck();  // Ensure UI update
                    }, 4000);
                }
            });
        }
    }
    
getallreport(){

    this._fileuploadService.getAllLoadReports()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((reports: CardHolderLoadReport[]) => {
        // Sort reports by 'loadDate' descending (recent first)
        this.loadReports = reports.sort((a, b) => {
            return new Date(b.loadDate).getTime() - new Date(a.loadDate).getTime();
        });
        
        this.dataSource.data = this.loadReports;  // Assign sorted data to the table

        console.log('Data fetched: ', reports);  // Debugging log for fetched data
        
        // Re-assign paginator and sort after data is loaded
        this.dataSource.paginator = this._paginator;
        this.dataSource.sort = this._sort;

        console.log('Paginator and sort assigned:', this._paginator, this._sort);  // Debugging log for paginator and sort

        this._changeDetectorRef.markForCheck();  // Trigger UI update
    });


}


    showAlert(): void {
        this._fuseAlertService.show('myAlertName');  // Make sure 'myAlertName' matches the alert name in the template
    }
  
    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); 
    }
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

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
}
