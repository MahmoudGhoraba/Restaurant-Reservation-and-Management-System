import express, { Router } from "express"
import MenuItemController from "../controllers/menuitem.controller"

const router: Router = express.Router()
router.post('/',/*AUTH(ADMIN)*/ MenuItemController.createMenuItem)
router.get('/:id', MenuItemController.getMenuItem)
router.put('/:id',/*AUTH(ADMIN)*/ MenuItemController.updateMenuItem)
router.delete('/:id',/*AUTH(ADMIN)*/ MenuItemController.deleteMenuItem)

export default router