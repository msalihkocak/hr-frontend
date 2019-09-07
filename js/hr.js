class Employee {
    constructor() {
        this.identity = ko.observable()
                          .extend({
                              minLength: 11,
                              maxLength: 11,
                              required: true
                          });
        this.fullname = ko.observable("Kate Austen")
                          .extend({
                              minLength: 6,
                              required: true
                          });
        this.salary = ko.observable(2000)
                        .extend({
                            min: 2000,
                            required: true
                        });
        this.isValid = ko.computed(()=>{
            for (let prop in this) {
                let o = this[prop];
                if (ko.isObservable(o) &&
                    o.hasOwnProperty('rules')){
                    if (!o.isValid()) return false;
                }
            }
            return true;
        });
        this.validate = () => {
            for (let prop in this) {
                let o = this[prop];
                if (ko.isObservable(o) &&
                    o.hasOwnProperty('rules')){
                    ko.validation.validateObservable(o);
                }
            }
        }
        this.photo = ko.observable(AppConfig.NO_IMAGE);
        this.update = this.update.bind(this);
    }

    update(employee) {
        for (let prop in this) {
            if (employee.hasOwnProperty(prop)) {
                if (ko.isObservable(this[prop]))
                    this[prop](employee[prop]);
                else
                    this[prop] = employee[prop];
            }
        }
    }
}

class HrViewModel {
    constructor() {
        this.employee = new Employee();
        this.employees = ko.observableArray([]);
        this.fileData = ko.observable({
            dataUrl: ko.observable(toSrcImage(AppConfig.NO_IMAGE))
        });
        this.removeEmployee = this.removeEmployee.bind(this);
        this.refreshEmployee = this.refreshEmployee.bind(this);
        this.addEmployee = this.addEmployee.bind(this);
        this.updateEmployee = this.updateEmployee.bind(this);
        this.findEmployee = this.findEmployee.bind(this);
        this.findAllEmployees = this.findAllEmployees.bind(this);
        this.changeLng = this.changeLng.bind(this);
        this.changeLngEn = this.changeLngEn.bind(this);
        this.changeLngTr = this.changeLngTr.bind(this);
        this.i18n = this.i18n.bind(this);
        this.insertFile = this.insertFile.bind(this);
        this.dragover = this.dragover.bind(this);
    }

    i18n() {
        $(document).i18n();
    }

    changeLngTr() {
        this.changeLng('tr');
    }

    changeLngEn() {
        this.changeLng('en');
    }

    changeLng(lng) {
        i18n.setLng(lng, () => {
            $(document).i18n();
            knockoutLocalize(lng);
            this.employee.validate();
        });
    }

    insertFile(e, data) {
        e.preventDefault();
        var files = e.target.files || e.originalEvent.dataTransfer.files;
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (event) => {
            this.fileData().dataUrl(event.target.result);
        };
    }

    dragover(e) {
        e.preventDefault();
    };

    addEmployee() {
        this.employee.photo(toRawImage(this.fileData().dataUrl()));
        $.ajax({
            method: "POST",
            url: AppConfig.REST_API_BASE_URL + "/employees",
            data: ko.toJSON(this.employee),
            contentType: "application/json",
            success: (emp) => {
                showSuccessMessage("Employee is added!");
            },
            error: ajaxErrorHandler
        })
    }

    updateEmployee() {
        this.employee.photo(toRawImage(this.fileData().dataUrl()));
        $.ajax({
            method: "PUT",
            url: AppConfig.REST_API_BASE_URL + "/employees",
            data: ko.toJSON(this.employee),
            contentType: "application/json",
            success: (emp) => {
                showSuccessMessage("Employee is updated!");
            },
            error: ajaxErrorHandler
        })

    }

    findEmployee() {
        $.ajax({
            method: "GET",
            url: AppConfig.REST_API_BASE_URL + "/employees/" + this.employee.identity(),
            success: (employee) => {
                showSuccessMessage("Employee is retrieved!");
                this.employee.update(employee);
                this.fileData().dataUrl(toSrcImage(employee.photo));
            },
            error: ajaxErrorHandler
        })
    }

    findAllEmployees() {
        $.ajax({
            method: "GET",
            url: AppConfig.REST_API_BASE_URL + "/employees?pageno=0&pagesize=10",
            success: (employees) => {
                showSuccessMessage("Employees are retrieved!");
                this.employees(employees);
            },
            error: ajaxErrorHandler
        })
    }

    removeEmployee(emp) {
        let identity = "";
        if (emp == undefined) {
            identity = this.employee.identity();
        } else {
            identity = emp.identity;
            this.employees.remove(emp);
        }
        $.ajax({
            method: "DELETE",
            url: AppConfig.REST_API_BASE_URL + "/employees/" + identity,
            success: (employee) => {
                toastr.info("Employee is deleted!", "HR", AppConfig.TOASTR_CONFIG);
                this.employee.update(employee);
                this.fileData().dataUrl(toSrcImage(employee.photo));
            },
            error: ajaxErrorHandler
        })
    }

    refreshEmployee(employee) {
        this.employee.update(employee);
        this.fileData().dataUrl(toSrcImage(employee.photo));
    }
};