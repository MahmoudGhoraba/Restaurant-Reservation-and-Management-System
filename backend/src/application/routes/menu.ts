import express, { Router } from "express"
import MenuItemController from "../controllers/menuitem.controller"
import authenticateMiddleware from "../../middlewares/authMiddleware"
import authorizationMiddleware from "../../middlewares/authorizeMiddleware"
import allowAdmin from "../../middlewares/allowAdminMiddleware"
const router: Router = express.Router()
router.post('/',authenticateMiddleware,authorizationMiddleware('Admin'),MenuItemController.createMenuItem)
router.get('/:id',authenticateMiddleware,authorizationMiddleware("Customer","Admin","Staff"),MenuItemController.getMenuItem)
router.patch('/:id',authenticateMiddleware,authorizationMiddleware('Admin'), MenuItemController.updateMenuItem)
router.delete('/:id',authenticateMiddleware,authorizationMiddleware('Admin'), MenuItemController.deleteMenuItem)

export default router