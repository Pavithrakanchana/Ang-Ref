
export interface VehVintelStatus {
        vin?: string;
        year?: string;
        make?: string;
        model?: string;
        bodyType?: string;
        trim?: string;
        reportType: 'VINTELLIGECE' | 'VINTELMANUAL';
}