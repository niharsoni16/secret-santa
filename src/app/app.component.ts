import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
interface UploadedFile {
  name: string;
  valid: boolean | null;
  type: 'employee' | 'past' | null;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  title = 'secret-santa-demo';
  fileName: any;
  nameIdMapping: any = {};
  empList: any = {};
  pastRecord: any;
  uploadedFiles: UploadedFile[] = [];
  employeeFileName: string = '';
  pastRecordFileName: string = '';

  constructor() { }

  ngOnInit(): void {
  
  }

  // #calculation start
  formatData(){
    let empList:any = localStorage.getItem("employees");
    let pastRecord:any = localStorage.getItem("pastRecord");
    this.empList = JSON.parse(empList).map((a:any)=>{
      return {
        name:a[0],
        email:a[1]
      }
    })
    this.pastRecord = JSON.parse(pastRecord).map((a:any)=>{
      return {
        name:a[0],
        email:a[1],
        secretChild:a[2],
        secretEmail:a[3],
      }
    })
    
  }

  assignSecretSanta(event:any){
    this.formatData();
    this.assignSanta();
  }

  assignSanta() {
    // assigning next person and true/false flag as per if violating entry exist
    this.assignNextPersonAndFlags()
  
    // next person assigned and now check if any record is violating the rule (Ex. same entry as past record)
    let needsFix = this.empList.filter((a: any) => a.flag === true);

    // Fix violations
    if (needsFix.length === 1) { 
      // single violation (if only one violation exist.. then we will swap with any non-violating record -- iterate from first to last)
      const violator = needsFix[0];
      this.handleSingleViolation(violator);
    }else if (needsFix.length > 1) {
      // Multiple violations ( here we will swap internally )
      this.handleMultipleViolations(needsFix);
    }
    console.log("Final Secret Santa List:", this.empList);
  }
  // #calculation end



  // #Upload File region start
  onFileChange(event: any) {
    const files = event.target.files;
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
  
        const reader = new FileReader();
        reader.onload = () => {
          readXlsxFile(file).then((rows: any) => {
            if (!rows || rows.length === 0) {
              this.uploadedFiles.push({ name: file.name, valid: false, type: null });
              return;
            }
  
            const header = rows[0];
            if (header.length === 2) {
              localStorage.setItem('employees', JSON.stringify(rows));
              this.employeeFileName = file.name;
              this.uploadedFiles.push({ name: file.name, valid: true, type: 'employee' });
            } else if (header.length === 4) {
              localStorage.setItem('pastRecord', JSON.stringify(rows));
              this.pastRecordFileName = file.name;
              this.uploadedFiles.push({ name: file.name, valid: true, type: 'past' });
            } else {
              this.uploadedFiles.push({ name: file.name, valid: false, type: null });
            }
          });
        };
  
        reader.readAsDataURL(file);
      }
    }
  }
  // #Upload File region end



  // #download File region start
  downloadAsExcel() {
    const dataToExport = this.empList.slice(1).map((emp: any) => ({
      Name: emp.name,
      Email: emp.email,
      "Secret Child": emp.secretChild,
      "Secret Email": emp.secretEmail
    }));
  
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SecretSanta');
  
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, `SecretSantaList_${new Date().getTime()}.xlsx`);
  }
  // #download File region end


  // #helper region start
  assignNextPersonAndFlags(){
    for (let i = 1; i < this.empList.length; i++) {
      let nextIndex = (i + 1 === this.empList.length) ? 1 : i + 1;
  
      let current = this.empList[i];
      let next = this.empList[nextIndex];
  
      current.secretEmail = next.email;
      current.secretChild = next.name;
      current.flag = this.validatePastRecord(current.email, next.email);
    }
  }

  validatePastRecord(email:any,secretEmail:any){
    let flag = false;
    if(email === secretEmail){
      flag = true;
    }else{
      const record = this.pastRecord.find((a:any)=>a.email === email)
      if(record.secretEmail == secretEmail) flag = true;
    }
    return flag;
  }

  handleSingleViolation(violator:any){
    for (let i = 1; i < this.empList.length; i++) {
      const candidate = this.empList[i];
      if (candidate.email === violator.email) continue;

      const success = this.swapAssignments(violator, candidate);
      if (success) break;
    }
  }

  handleMultipleViolations(needsFix: any[]) {
    for (let i = 0; i < needsFix.length; i++) {
      const employeeA = needsFix[i];
  
      for (let j = i + 1; j < needsFix.length; j++) {
        const employeeB = needsFix[j];
  
        const success = this.swapAssignments(employeeA, employeeB);
        if (success) break;
      }
    }
  }

  swapAssignments(empA: any, empB: any): boolean {
    const tempChild = empA.secretChild;
    const tempEmail = empA.secretEmail;
  
    // Swap secret assignments
    empA.secretChild = empB.secretChild;
    empA.secretEmail = empB.secretEmail;
    empB.secretChild = tempChild;
    empB.secretEmail = tempEmail;
  
    // Revalidate
    // Reason : we are iterating through loop again... so need to check if this is valid or not
    const flagA = this.validatePastRecord(empA.email, empA.secretEmail);
    const flagB = this.validatePastRecord(empB.email, empB.secretEmail);
  
    if (!flagA && !flagB) {
      empA.flag = false;
      empB.flag = false;
      return true; // No violation
    }
  
    // still violating.. so revert
    empB.secretChild = empA.secretChild;
    empB.secretEmail = empA.secretEmail;
    empA.secretChild = tempChild;
    empA.secretEmail = tempEmail;
  
    return false;
  }
  clearStorage() {
    localStorage.clear();
    this.employeeFileName = '';
    this.pastRecordFileName = '';
    console.log("LocalStorage cleared.");
  }
  // #helper region end


}
