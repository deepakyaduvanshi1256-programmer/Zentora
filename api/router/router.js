import express from 'express';
import { userRegister, userLogin } from '../controller/authcontroller.js';
import { adminUserList, adminClientList, adminProjectList, adminBidList, adminPlanList, toggleBlockUser, adminBlockProject, adminDeleteUser, adminDeleteProject } from '../controller/adminController.js';
import { clientProjectList, postProject, listOpenProjects, listMyAssignedProjects, updateProjectStatus, updateProject, approveCompletedProject, requestProjectRevision, requestProjectStart, receiveCompletedProject } from '../controller/ClientController.js';
import { placeBid, getBidsForProject, getMyBids, acceptBid, rejectBid, updateMyBid, submitProjectForReview, confirmProjectStart, sendProjectConversationMessage, getProjectConversation } from '../controller/bidController.js';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, deleteReadNotifications } from '../controller/notificationController.js';
import { getAdminEmailSettings, updateAdminEmailSettings, getAdminEmailLogs, testAdminEmail, getAdminActivity, adminDeleteBid } from '../controller/adminEmailController.js';
import { listPlans, createPlan, updatePlan, buyPlan } from '../controller/planController.js';
import { getMe, updateProfile, changePassword } from '../controller/profileController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';
import { deliveryUpload } from '../middleware/upload.js';
import { submitContactMessage } from '../controller/contactController.js';

const router = express.Router();

router.post('/contact', submitContactMessage);

// ---------------- Public / Auth ----------------
router.post("/register", userRegister)
router.post("/login", userLogin)
router.get('/plans', listPlans) // public pricing page

// ---------------- Admin (requires admin role) ----------------
router.get('/admin-user-list', verifyToken, allowRoles("admin"), adminUserList)
router.get('/admin-client-list', verifyToken, allowRoles("admin"), adminClientList)
router.get('/admin-project-list', verifyToken, allowRoles("admin"), adminProjectList)
router.get('/admin-bid-list', verifyToken, allowRoles("admin"), adminBidList)
router.post('/admin-toggle-block-user', verifyToken, allowRoles("admin"), toggleBlockUser)
router.post('/admin-delete-user', verifyToken, allowRoles("admin"), adminDeleteUser)
router.post('/admin-block-project', verifyToken, allowRoles("admin"), adminBlockProject)
router.post('/admin-delete-project', verifyToken, allowRoles("admin"), adminDeleteProject)
router.post('/admin-create-plan', verifyToken, allowRoles("admin"), createPlan)
router.post('/admin-update-plan', verifyToken, allowRoles("admin"), updatePlan)
router.get('/admin-plan-list', verifyToken, allowRoles("admin"), adminPlanList)
router.post('/admin-delete-bid', verifyToken, allowRoles("admin"), adminDeleteBid)
router.get('/admin-activity', verifyToken, allowRoles("admin"), getAdminActivity)
router.get('/admin-email-settings', verifyToken, allowRoles("admin"), getAdminEmailSettings)
router.post('/admin-email-settings', verifyToken, allowRoles("admin"), updateAdminEmailSettings)
router.get('/admin-email-logs', verifyToken, allowRoles("admin"), getAdminEmailLogs)
router.post('/admin-email-test', verifyToken, allowRoles("admin"), testAdminEmail)

// ---------------- Client ----------------
router.post('/client-post-project', verifyToken, allowRoles("client"), postProject)
router.get('/client-post-list', verifyToken, allowRoles("client"), clientProjectList)
router.post('/client-update-project-status', verifyToken, allowRoles("client"), updateProjectStatus)
router.post('/client-update-project', verifyToken, allowRoles("client"), updateProject)
router.post('/client-approve-project', verifyToken, allowRoles("client"), approveCompletedProject)
router.post('/client-request-project-revision', verifyToken, allowRoles("client"), requestProjectRevision)
router.post('/client-request-project-start', verifyToken, allowRoles("client"), requestProjectStart)
router.post('/client-receive-project', verifyToken, allowRoles("client"), receiveCompletedProject)
router.post('/project-message', verifyToken, sendProjectConversationMessage)
router.get('/project-message/:projectId', verifyToken, getProjectConversation)
router.get('/client-project-bids', verifyToken, allowRoles("client"), getBidsForProject)
router.post('/client-accept-bid', verifyToken, allowRoles("client"), acceptBid)
router.post('/client-reject-bid', verifyToken, allowRoles("client"), rejectBid)

// ---------------- Developer (type "user") ----------------
router.get('/developer-open-projects', verifyToken, allowRoles("user"), listOpenProjects)
router.get('/developer-my-projects', verifyToken, allowRoles("user"), listMyAssignedProjects)
router.post('/developer-place-bid', verifyToken, allowRoles("user"), placeBid)
router.post('/developer-update-bid', verifyToken, allowRoles("user"), updateMyBid)
router.post('/developer-submit-project', verifyToken, allowRoles("user"), deliveryUpload.single("deliveryFile"), submitProjectForReview)
router.post('/developer-confirm-project-start', verifyToken, allowRoles("user"), confirmProjectStart)
router.get('/developer-my-bids', verifyToken, allowRoles("user"), getMyBids)
router.post('/developer-buy-plan', verifyToken, allowRoles("user"), buyPlan)

// ---------------- Profile (any logged-in user) ----------------
router.get('/profile', verifyToken, getMe)
router.post('/update-profile', verifyToken, updateProfile)
router.post('/change-password', verifyToken, changePassword)

// ---------------- Notifications (any logged-in user) ----------------
router.get('/notifications', verifyToken, getNotifications)
router.post('/notifications-mark-read', verifyToken, markNotificationRead)
router.post('/notifications-mark-all-read', verifyToken, markAllNotificationsRead)
router.post('/notifications-delete', verifyToken, deleteNotification)
router.post('/notifications-delete-read', verifyToken, deleteReadNotifications)

export default router;
