import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { getRecommendFriends, getMyFriends , sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs} from '../controllers/user.controller.js';
const router = express.Router();

router.use(protectRoute);

router.get('/', getRecommendFriends);
router.get('/friends', getMyFriends);
router.post('/friend-request/:id', sendFriendRequest);
router.put('/friend-request/:id/accept', acceptFriendRequest);
router.get('/friend-requests', getFriendRequests);
export default router;