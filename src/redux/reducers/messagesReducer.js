const messagesReducer = (state = {
    addNewOrganizationSnackBar: false,
    surveyCompletedSnackBar: false,
    confirmDeactivateSnackBar: false,
    registrationCompletedSnackBar: false,
    loginSnackbar: false,
    loginError: false,
    deactivedOrganization: false,
    addedEmployees: false,
    addedManagers: false,
    surveySubmitted: false,
}, action) => {
    //each component of state corresponds to a dialog that lives on app.js
    //on actions that trigger this reducer open or close one of these dialogs
    switch (action.type) {
        case 'ADD_NEW_ORGANIZATION_SNACKBAR':
            return {
                ...state,
                addNewOrganizationSnackBar: true,
            }
        case 'SURVEY_COMPLETED_SNACKBAR':
            return {
                ...state,
                surveyCompletedSnackBar: true,
            }
        case 'CONFIRM_DEACTIVATE_SNACKBAR':
            return {
                ...state,
                confirmDeactivateSnackBar: true,
            }
        case 'REGISTRATION_COMPLETED_SNACKBAR':
            return {
                ...state,
                registrationCompletedSnackBar: true,
            }
        case 'LOGIN_SNACKBAR':
            return {
                ...state,
                loginSnackbar: true,
            }
        case 'CLOSE_SNACKBAR':
            return {
                ...state,
                addNewOrganizationSnackBar: false,
                surveyCompletedSnackBar: false,
                confirmDeactivateSnackBar: false,
                registrationCompletedSnackBar: false,
                loginSnackbar: false,
            }//this one action handles closing all snackbars

        // Daniel cases above, Eli Cases below

        default:
            return state;
    }
};

// user will be on the redux state at:
// state.user
export default messagesReducer;