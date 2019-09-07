let hrViewModel= new HrViewModel();
$(
    () => {
        initializeToastr({
            timeOut: 3000,
            closeDuration: 500,
            closeEasing: 'swing',
            progressBar: true,
            preventDuplicates: true,
            closeButton: true,
            positionClass: 'toast-top-center'

        });
        i18n.init({
            lng: "en",
            resGetPath: "resources/__ns__-__lng__.json",
            fallbackLng: "en"
        }, (t) => {
            $(document).i18n();
            knockoutLocalize('en');
            ko.validation.init({
                decorateElement: true,
                decorateInputElement: true,
                insertMessages: true,
                errorElementClass: 'has-warning',
                errorMessageClass: 'has-error'
            }, true);
            ko.applyBindings(hrViewModel);
            setTimeout(()=>{hrViewModel.employee.validate();            $(document).i18n();
                knockoutLocalize('en');
            },2000)
        })
    }
);

