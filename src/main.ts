import "./style.css"
import { initCanvas } from "./canvas"
import { initSelectionDialog } from "./select-dialog"
import { recipeMap } from "./recipe"

const canvas = document.getElementById("canvas") as HTMLCanvasElement
const selectionDialog = document.getElementById(
  "selection-dialog"
) as HTMLDialogElement

initCanvas(canvas)
initSelectionDialog({
  dialog: selectionDialog,
  onSelected: recipeName => {
    console.log("selected", recipeMap.get(recipeName))
  },
})
// Markup includes dialog element already shown, we have to reopen it
// so it becomes modal, and also draws ::backdrop pseudo-element
selectionDialog.close()
selectionDialog.showModal()
