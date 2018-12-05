'use strict';

import casesRouting from './cases.routing'

const app = angular.module('RedhatAccess.cases', [
    'ui.router',
    'ui.bootstrap',
    'localytics.directives',
    'ngTable',
    'angular-md5',
    'RedhatAccess.template',
    'RedhatAccess.security',
    'RedhatAccess.search',
    'RedhatAccess.ui-utils',
    'RedhatAccess.common',
    'RedhatAccess.header',
    'dndLists'
]);

// Constants
import ACCOUNT_EVENTS from './constants/accountEvents'
import CHAT_SUPPORT from './constants/chatSupport'
import STATUS from './constants/status'
import CASE_EVENTS from './constants/caseEvents'
import CASE_GROUPS from './constants/caseGroups'

app.constant('CASE_EVENTS', CASE_EVENTS);
app.constant('ACCOUNT_EVENTS', ACCOUNT_EVENTS);
app.constant('CHAT_SUPPORT', CHAT_SUPPORT);
app.constant('STATUS', STATUS);
app.constant('CASE_GROUPS', CASE_GROUPS);

// Values
import NEW_DEFAULTS from './values/newDefaults'
import GLOBAL_CASE_CONFIG from './values/globalCaseConfig'
import NEW_CASE_CONFIG from './values/newCaseConfig'
import EDIT_CASE_CONFIG from './values/editCaseConfig'

app.value('NEW_DEFAULTS', NEW_DEFAULTS);
app.value('GLOBAL_CASE_CONFIG', GLOBAL_CASE_CONFIG);
app.value('NEW_CASE_CONFIG', NEW_CASE_CONFIG);
app.value('EDIT_CASE_CONFIG', EDIT_CASE_CONFIG);

// Routing
app.config(casesRouting);

// Controllers
import AccountBookmarkHome from './controllers/accountBookmarkHome'
import AccountSearch from './controllers/accountSearch'
import AccountSelect from './controllers/accountSelect'
import AddCommentSection from './controllers/addCommentSection'
import AdvancedSearchController from './controllers/advancedSearchController'
import AttachLocalFile from './controllers/attachLocalFile'
import List from './controllers/list'
import AttachmentsSection from './controllers/attachmentsSection'
import BackEndAttachmentsCtrl from './controllers/backendAttachments'
import BookmarkAccount from './controllers/bookmarkAccount'
import BookmarkedAccountSelect from './controllers/bookmarkedAccountSelect'
import CommonConfirmationModal from './controllers/commonConfirmationModal'
import ChangeOwnerModal from './controllers/changeOwnerModal'
import CreateGroupButton from './controllers/createGroupButton'
import CreateGroupModal from './controllers/createGroupModal'
import DeleteGroupButton from './controllers/deleteGroupButton'
import DescriptionSection from './controllers/descriptionSection'
import DetailsSection from './controllers/detailsSection'
import DiscussionSection from './controllers/discussionSection'
import Edit from './controllers/edit'
import EditCaseRecommendationsController from './controllers/editCaseRecommendationsSection'
import EmailNotifySelect from './controllers/emailNotifySelect'
import ExistingBookmarkedAccounts from './controllers/existingBookmarkedAccounts'
import ExportCSVButton from './controllers/exportCSVButton'
import FilterSelect from './controllers/filterSelect'
import Group from './controllers/group'
import GroupList from './controllers/groupList'
import GroupSelect from './controllers/groupSelect'
import ListAttachments from './controllers/listAttachments'
import ListBugzillas from './controllers/listBugzillas'
import ListFilter from './controllers/listFilter'
import ListNewAttachments from './controllers/listNewAttachments'
import ManageGroupList from './controllers/manageGroupList'
import ManageGroups from './controllers/manageGroups'
import ManageGroupUsers from './controllers/manageGroupUsers'
import New from './controllers/new'
import NewCaseRecommendationsController from './controllers/newCaseRecommendationsSection'
import OwnerSelect from './controllers/ownerSelect'
import ProceedWithoutAttachModal from './controllers/proceedWithoutAttachModal'
import ProductSelect from './controllers/productSelect'
import RequestEscalation from './controllers/requestEscalation'
import ShowRmeEscalation from './controllers/showRMEEscalation'
import RequestManagementEscalationModal from './controllers/requestManagementEscalationModal'
import CepModal from './controllers/cepModal'
import SearchBox from './controllers/searchBox'
import SeveritySelect from './controllers/severitySelect'
import SolrQueryInputController from './controllers/solrQueryInput'
import StatusSelect from './controllers/statusSelect'
import TypeSelect from './controllers/typeSelect'
import VersionSelect from './controllers/versionSelect'
import SearchBookmarkModal from './controllers/searchBookmarkModal'
import AdvancedSearchCaseList from './controllers/advancedSearchCaseList'
import ColumnSelectModal from './controllers/columnSelectModal'
import ManagedAccountSelect from './controllers/managedAccountSelect'
import SecureSupportHeader from './controllers/secureSupportHeader'


app.controller('ManagedAccountSelect', ManagedAccountSelect);
app.controller('SecureSupportHeader', SecureSupportHeader);
app.controller('AccountBookmarkHome', AccountBookmarkHome);
app.controller('AccountSearch', AccountSearch);
app.controller('AccountSelect', AccountSelect);
app.controller('AddCommentSection', AddCommentSection);
app.controller('AdvancedSearchController', AdvancedSearchController);
app.controller('AttachLocalFile', AttachLocalFile);
app.controller('AttachmentsSection', AttachmentsSection);
app.controller('BackEndAttachmentsCtrl', BackEndAttachmentsCtrl);
app.controller('BookmarkAccount', BookmarkAccount);
app.controller('BookmarkedAccountSelect', BookmarkedAccountSelect);
app.controller('CommonConfirmationModal', CommonConfirmationModal);
app.controller('ChangeOwnerModal', ChangeOwnerModal);
app.controller('CreateGroupButton', CreateGroupButton);
app.controller('CreateGroupModal', CreateGroupModal);
app.controller('DeleteGroupButton', DeleteGroupButton);
app.controller('DescriptionSection', DescriptionSection);
app.controller('DetailsSection', DetailsSection);
app.controller('DiscussionSection', DiscussionSection);
app.controller('Edit', Edit );
app.controller('EditCaseRecommendationsController', EditCaseRecommendationsController);
app.controller('EmailNotifySelect', EmailNotifySelect);
app.controller('ExistingBookmarkedAccounts', ExistingBookmarkedAccounts);
app.controller('ExportCSVButton', ExportCSVButton);
app.controller('FilterSelect', FilterSelect);
app.controller('Group', Group);
app.controller('GroupList', GroupList);
app.controller('GroupSelect', GroupSelect);
app.controller('List', List);
app.controller('ListAttachments', ListAttachments);
app.controller('ListBugzillas', ListBugzillas);
app.controller('ListFilter', ListFilter);
app.controller('ListNewAttachments', ListNewAttachments);
app.controller('ManageGroupList', ManageGroupList);
app.controller('ManageGroups', ManageGroups);
app.controller('ManageGroupUsers', ManageGroupUsers);
app.controller('New', New);
app.controller('NewCaseRecommendationsController', NewCaseRecommendationsController);
app.controller('OwnerSelect', OwnerSelect);
app.controller('ProceedWithoutAttachModal', ProceedWithoutAttachModal);
app.controller('ProductSelect', ProductSelect);
app.controller('RequestEscalation', RequestEscalation);
app.controller('ShowRmeEscalation', ShowRmeEscalation);
app.controller('RequestManagementEscalationModal', RequestManagementEscalationModal);
app.controller('CepModal', CepModal);
app.controller('SearchBox', SearchBox);
app.controller('SeveritySelect', SeveritySelect);
app.controller('SolrQueryInputController', SolrQueryInputController);
app.controller('StatusSelect', StatusSelect);
app.controller('TypeSelect', TypeSelect);
app.controller('VersionSelect', VersionSelect);
app.controller('SearchBookmarkModal', SearchBookmarkModal);
app.controller('AdvancedSearchCaseList', AdvancedSearchCaseList);
app.controller('ColumnSelectModal', ColumnSelectModal);

// Directives
import rhaAttachlocalfile from './directives/attachLocalFile'
import rhaAccountSearch from './directives/accountSearch'
import rhaCaseattachments from './directives/attachmentsSection'
import rhaAccountselect from './directives/accountSelect'
import rhaAttachproductlogs from './directives/attachProductLogs'
import rhaAddcommentsection from './directives/addCommentSection'
import rhaBookmarkAccount from './directives/bookmarkAccount'
import rhaBookmarkedAccountsSelect from './directives/bookmarkedAccountSelect'
import chosen from './directives/chosenPlaceholder'
import rhaCreategroupbutton from './directives/createGroupButton'
import rhaDeletegroupbutton from './directives/deleteGroupButton'
import rhaCasedescription from './directives/descriptionSection'
import rhaCasedetails from './directives/detailsSection'
import rhaCasediscussion from './directives/discussionSection'
import rhaEditcaserecommendations from './directives/editCaseRecommendationsSection'
import rhaEmailnotifyselect from './directives/emailNotifySelect'
import equalWidths from './directives/equalWidths'
import rhaExistingBookmarkedAccounts from './directives/existingBookmarkedAccounts'
import rhaExportcsvbutton from './directives/exportCSVButton'
import rhaFilterselect from './directives/filterSelect'
import rhaFocusOn from './directives/focusOn'
import rhaGrouplist from './directives/groupList'
import rhaGroupselect from './directives/groupSelect'
import rhaListattachments from './directives/listAttachments'
import rhaListbugzillas from './directives/listBugzillas'
import rhaListfilter from './directives/listFilter'
import rhaListnewattachments from './directives/listNewAttachments'
import rhaManagegrouplist from './directives/manageGroupList'
import rhaManagegroupusers from './directives/manageGroupUsers'
import rhaNewcaserecommendations from './directives/newCaseRecommendationsSection'
import rhaOwnerselect from './directives/ownerSelect'
import rhaProductselect from './directives/productSelect'
import rhaRequestescalation from './directives/requestEscalation'
import rhaShowrmeescalation from './directives/showRMEEscalation'
import scrollHide from './directives/scrollHide'
import rhaSearchbox from './directives/searchBox'
import rhaSelectloadingindicator from './directives/selectLoadingIndicator'
import rhaSeverityselect from './directives/severitySelect'
import rhaSolrQueryInput from './directives/solrQueryInput'
import rhaStatusselect from './directives/statusSelect'
import rhaTypeselect from './directives/typeSelect'
import rhaVersionselect from './directives/versionSelect'
import pagination from './directives/pagination'

app.directive('rhaAccountSearch', rhaAccountSearch);
app.directive('rhaAccountselect', rhaAccountselect);
app.directive('rhaAddcommentsection', rhaAddcommentsection);
app.directive('rhaAttachlocalfile', rhaAttachlocalfile);
app.directive('rhaCaseattachments', rhaCaseattachments);
app.directive('rhaAttachproductlogs', rhaAttachproductlogs);
app.directive('rhaBookmarkAccount', rhaBookmarkAccount);
app.directive('rhaBookmarkedAccountsSelect', rhaBookmarkedAccountsSelect);
app.directive('chosen', chosen);
app.directive('rhaCreategroupbutton', rhaCreategroupbutton);
app.directive('rhaDeletegroupbutton', rhaDeletegroupbutton);
app.directive('rhaCasedescription', rhaCasedescription);
app.directive('rhaCasedetails', rhaCasedetails);
app.directive('rhaCasediscussion', rhaCasediscussion);
app.directive('rhaEditcaserecommendations', rhaEditcaserecommendations);
app.directive('rhaEmailnotifyselect', rhaEmailnotifyselect);
app.directive('equalWidths', equalWidths);
app.directive('rhaExistingBookmarkedAccounts', rhaExistingBookmarkedAccounts);
app.directive('rhaExportcsvbutton', rhaExportcsvbutton);
app.directive('rhaFilterselect', rhaFilterselect);
app.directive('rhaFocusOn', rhaFocusOn);
app.directive('rhaGrouplist', rhaGrouplist);
app.directive('rhaGroupselect', rhaGroupselect);
app.directive('rhaListattachments', rhaListattachments);
app.directive('rhaListbugzillas', rhaListbugzillas);
app.directive('rhaListfilter', rhaListfilter);
app.directive('rhaListnewattachments', rhaListnewattachments);
app.directive('rhaManagegrouplist', rhaManagegrouplist);
app.directive('rhaManagegroupusers', rhaManagegroupusers);
app.directive('rhaNewcaserecommendations', rhaNewcaserecommendations);
app.directive('rhaOwnerselect', rhaOwnerselect);
app.directive('rhaProductselect', rhaProductselect);
app.directive('rhaRequestescalation', rhaRequestescalation);
app.directive('rhaShowrmeescalation', rhaShowrmeescalation);
app.directive('scrollHide', scrollHide);
app.directive('rhaSearchbox', rhaSearchbox);
app.directive('rhaSelectloadingindicator', rhaSelectloadingindicator);
app.directive('rhaSeverityselect', rhaSeverityselect);
app.directive('rhaSolrQueryInput', rhaSolrQueryInput);
app.directive('rhaStatusselect', rhaStatusselect);
app.directive('rhaTypeselect', rhaTypeselect);
app.directive('rhaVersionselect', rhaVersionselect);
app.directive('pagination', pagination);

//Components
import rhaAdvancedSearchCaseList from './components/advancedSearchCaseList'
import rhaManagedAccountsSelect from './components/managedAccountSelect'
import rhaSecureSupportHeader from './components/secureSupportHeader'

app.component('rhaManagedAccountsSelect', rhaManagedAccountsSelect);
app.component('rhaAdvancedSearchCaseList', rhaAdvancedSearchCaseList);
app.component('rhaSecureSupportHeader', rhaSecureSupportHeader);

// Filters
import bytes from './filters/bytes'
import substring from './filters/substring'
import startFrom from './filters/startFrom';

app.filter('bytes', bytes);
app.filter('substring', substring);
app.filter('startFrom', startFrom);

// Services
import AccountBookmarkService from './services/accountBookmarkService'
import AccountService from './services/accountService'
import AdvancedCaseSearchService from './services/advancedCaseSearchService'
import AttachmentsService from './services/attachmentsService'
import CaseListService from './services/caseListService'
import CaseService from './services/caseService'
import DiscussionService from './services/discussionService'
import GroupService from './services/groupService'
import GroupUserService from './services/groupUserService'
import LinkifyService  from './services/linkifyService'
import ManageGroupsService  from './services/manageGroupsService'
import ProductsService from './services/productsService'
import RecommendationsService from './services/recommendationsService'
import SearchBoxService from './services/searchBoxService'
import SearchCaseService from './services/searchCaseService'
import SOLRGrammarService from './services/solrGrammarService'
import SearchBookmarkService from './services/searchBookmarkService'


app.service('AccountBookmarkService', AccountBookmarkService);
app.service('AccountService', AccountService);
app.service('AdvancedCaseSearchService', AdvancedCaseSearchService);
app.service('AttachmentsService', AttachmentsService);
app.service('CaseListService', CaseListService);
app.service('CaseService', CaseService);
app.service('DiscussionService', DiscussionService);
app.service('GroupService', GroupService);
app.service('GroupUserService', GroupUserService);
app.service('LinkifyService',  LinkifyService);
app.service('ManageGroupsService',  ManageGroupsService);
app.service('ProductsService', ProductsService);
app.service('RecommendationsService', RecommendationsService);
app.service('SearchBoxService', SearchBoxService);
app.service('SearchCaseService', SearchCaseService);
app.service('SOLRGrammarService', SOLRGrammarService);
app.service('SearchBookmarkService', SearchBookmarkService);

export default app.name;
