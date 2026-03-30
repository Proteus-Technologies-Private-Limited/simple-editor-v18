import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { SimpleEditorModule } from '../../components/simple_editor/simple_editor.module';

@Component({
    selector: 'app-editor-wrapper',
    standalone: true,
    imports: [CommonModule, SimpleEditorModule],
    template: `
        <div class="editor-container" *ngIf="pluginMetadata">
            <simple_editor [pluginMetadata]="pluginMetadata"></simple_editor>
        </div>
        <div class="loading-container" *ngIf="!pluginMetadata">
            <div class="loading-spinner"></div>
            <p>Loading editor...</p>
        </div>
    `,
    styles: [`
        .editor-container {
            height: 100vh;
            width: 100%;
        }
        .loading-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-container p {
            margin-top: 16px;
            color: #666;
        }
    `]
})
export default class EditorWrapperComponent implements OnInit, OnDestroy {
    pluginMetadata: any = null;
    private initialized = false;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        // Login form auth check - commented out as iframe provides auth tokens directly
        // if (!this.authService.isAuthenticated()) {
        //     this.router.navigate(['/login']);
        //     return;
        // }

        // Get query parameters - only process once
        this.route.queryParams.pipe(
            takeUntil(this.destroy$)
        ).subscribe(params => {
            // Prevent multiple initializations
            if (this.initialized) {
                return;
            }
            this.initialized = true;

            const objName = params['OBJ_NAME'] || '';
            const editFlag = params['EDIT_FLAG'] || 'A';
            const pkValues = params['PK_VALUES'] || '';
            const editorId = params['EDITOR_ID'] || '';
            const objCtx = params['OBJ_CTX'] || '1';
            const refSer = params['REF_SER'] || '';
            const noOfForms = params['NO_OF_FORMS'] || '4';

            // Build component data for SimpleEditorComponent
            const randomId = Math.floor(100000000 + Math.random() * 900000000);
            const finalEditorId = editorId || String(randomId);

            // SimpleEditorComponent expects pluginMetadata with compData nested inside
            const compData = {
                componentName: 'simple_editor',
                targetId: 'simple_editor',
                OBJ_NAME: objName,
                STARTFORM: '1',
                OBJ_CTX: objCtx,
                EDIT_FLAG: editFlag,
                EDITOR_ID: finalEditorId,
                ACTION: 'FIRST_CALL_BROWSER',
                EDITOR: 'MobEditor',
                dummyInt: '0.8888430630576809',
                Caller: 'GWT',
                PK_VALUES: pkValues,
                NO_OF_FORMS: noOfForms,
                CORE_MDL_ID: finalEditorId,
                REQ_PARAM_STR: '',
                DEFAULT_EDITOR: 'true',
                RTEURN_TYPE: 'json',
                REF_SER: refSer,
                LOGINID: sessionStorage.getItem('USER_NAME') || 'USER',
                TOKEN_ID: params['TOKEN_ID'] || this.authService.getTokenId() || '',
                JSESSIONID: params['JSESSIONID'] || this.authService.getJSessionId() || '',
                HOST_NAME: ''
            };

            // Wrap in pluginMetadata structure as expected by SimpleEditorComponent
            this.pluginMetadata = {
                compData: compData
            };

            console.log('Editor pluginMetadata:', this.pluginMetadata);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
