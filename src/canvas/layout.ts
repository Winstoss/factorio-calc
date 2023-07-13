import { RecipeNode, RootNode, assemblerCount } from "../graph"
import { iconNameForRecipe } from "../icon"
import { t } from "../recipe"
import { recipeName } from "../recipe"
import type { Color, ComputedFont, Widget } from "./common"

const BOX_PADDING = 8
const BOX_CONTENT_MARGIN = 8
const BOX_CONTENT_PADDING = 8
const ICON_MARGIN = 12
const ICON_SIZE = 28
const BUTTON_MARGIN = 12
const BUTTON_PADDING = 4
const REQUIRED_AMOUNT_MARGIN = 24

type Font = {
  family: string
  size: number
  weight: number
}

const TITLE_FONT = {
  family: "sans-serif",
  size: 18,
  weight: 600,
}
const BODY_FONT = {
  family: "sans-serif",
  size: 14,
  weight: 600,
}
const REQUIRED_AMOUNT_FONT = {
  family: "sans-serif",
  size: 14,
  weight: 600,
}

const LINE_SPACING = 1.5

const BOX_BG = "#313131" as Color
const BODY_BG = "#404040" as Color
const BUTTON_BG = "#606060" as Color
const TITLE_COLOR = "rgb(255, 231, 190)" as Color
const TEXT_COLOR = "white" as Color
const REQUIRED_AMOUNT_COLOR = "#ccc" as Color

function computeFont(font: Font) {
  return `${font.weight} ${font.size}px ${font.family}` as ComputedFont
}

const computedFonts = {
  title: computeFont(TITLE_FONT),
  body: computeFont(BODY_FONT),
  requiredAmount: computeFont(REQUIRED_AMOUNT_FONT),
}

function text(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: Font | ComputedFont,
) {
  font = typeof font === "string" ? font : computeFont(font)
  const prevFont = ctx.font
  ctx.font = font
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
    ctx.measureText(text)
  ctx.font = prevFont
  return {
    width,
    height: actualBoundingBoxAscent + actualBoundingBoxDescent,
    baseline: actualBoundingBoxAscent,
  }
}

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})

function lineMargin(font: Font) {
  return font.size * (LINE_SPACING - 1)
}

type LayoutResult = {
  bbox: { width: number; height: number }
  contents: Widget[]
}

export function rootBox(
  ctx: CanvasRenderingContext2D,
  node: RootNode,
): LayoutResult {
  const name = recipeName(node.recipe)
  const titleMeasures = text(ctx, name, computedFonts.title)
  const headerHeight = Math.max(titleMeasures.height, ICON_SIZE)
  const headerWidth = ICON_SIZE + ICON_MARGIN + titleMeasures.width

  const productionLine = `Desired production rate: ${node.desiredProduction} per second`
  const productionLineMeasures = text(ctx, productionLine, computedFonts.body)

  const craftingTime = `Crafting time: ${node.recipe.energy_required ?? 0.5}s`
  const craftingTimeMeasures = text(ctx, craftingTime, computedFonts.body)

  const assemblersRequired = `Assemblers required: ${numberFormat.format(
    assemblerCount(
      node.recipe,
      node.desiredProduction,
      node.assemblyMachineTier,
    ),
  )}`
  const assemblersRequiredMeasures = text(
    ctx,
    assemblersRequired,
    computedFonts.body,
  )

  const assemblerLineHeight = Math.max(
    BUTTON_PADDING * 2 + ICON_SIZE,
    assemblersRequiredMeasures.height,
  )
  const assemblerLineWidth =
    BUTTON_PADDING * 2 +
    ICON_SIZE +
    BUTTON_MARGIN +
    assemblersRequiredMeasures.width

  const bodyWidth =
    BOX_CONTENT_PADDING * 2 +
    Math.max(
      productionLineMeasures.width,
      craftingTimeMeasures.width,
      assemblerLineWidth,
    )
  const bodyHeight =
    BOX_CONTENT_PADDING * 2 +
    productionLineMeasures.height +
    lineMargin(BODY_FONT) +
    craftingTimeMeasures.height +
    lineMargin(BODY_FONT) +
    assemblerLineHeight

  const bbox = {
    width: BOX_PADDING * 2 + Math.max(headerWidth, bodyWidth),
    height: BOX_PADDING * 2 + headerHeight + BOX_CONTENT_MARGIN + bodyHeight,
  }

  return {
    bbox,
    contents: [
      {
        type: "box",
        bg: BOX_BG,
        layout: {
          x: 0,
          y: 0,
          width: bbox.width,
          height: bbox.height,
        },
      },
      {
        type: "box",
        bg: BODY_BG,
        layout: {
          x: BOX_PADDING,
          y: BOX_PADDING + headerHeight + BOX_CONTENT_MARGIN,
          width: bodyWidth,
          height: bodyHeight,
        },
      },
      {
        type: "icon",
        name: iconNameForRecipe(node.recipe),
        layout: {
          x: BOX_PADDING,
          y: BOX_PADDING + headerHeight / 2 - ICON_SIZE / 2,
          width: ICON_SIZE,
          height: ICON_SIZE,
        },
      },
      {
        type: "text",
        text: name,
        font: computedFonts.title,
        color: TITLE_COLOR,
        baseline: titleMeasures.baseline,
        layout: {
          x: BOX_PADDING + ICON_SIZE + ICON_MARGIN,
          y: BOX_PADDING + headerHeight / 2 - titleMeasures.height / 2,
          width: titleMeasures.width,
          height: titleMeasures.height,
        },
      },
      {
        type: "text",
        text: productionLine,
        font: computedFonts.body,
        color: TEXT_COLOR,
        baseline: productionLineMeasures.baseline,
        layout: {
          x: BOX_PADDING + BOX_CONTENT_PADDING,
          y:
            BOX_PADDING +
            headerHeight +
            BOX_CONTENT_MARGIN +
            BOX_CONTENT_PADDING,
          width: productionLineMeasures.width,
          height: productionLineMeasures.height,
        },
      },
      {
        type: "text",
        text: craftingTime,
        font: computedFonts.body,
        color: TEXT_COLOR,
        baseline: craftingTimeMeasures.baseline,
        layout: {
          x: BOX_PADDING + BOX_CONTENT_PADDING,
          y:
            BOX_PADDING +
            headerHeight +
            BOX_CONTENT_MARGIN +
            BOX_CONTENT_PADDING +
            productionLineMeasures.height +
            lineMargin(BODY_FONT),
          width: craftingTimeMeasures.width,
          height: craftingTimeMeasures.height,
        },
      },
      {
        type: "box",
        bg: BUTTON_BG,
        layout: {
          x: BOX_PADDING + BOX_CONTENT_PADDING,
          y:
            BOX_PADDING +
            headerHeight +
            BOX_CONTENT_MARGIN +
            BOX_CONTENT_PADDING +
            productionLineMeasures.height +
            lineMargin(BODY_FONT) +
            craftingTimeMeasures.height +
            lineMargin(BODY_FONT) +
            assemblerLineHeight / 2 -
            (BUTTON_PADDING * 2 + ICON_SIZE) / 2,
          width: BUTTON_PADDING * 2 + ICON_SIZE,
          height: BUTTON_PADDING * 2 + ICON_SIZE,
        },
      },
      {
        type: "icon",
        name: `assembling-machine-${node.assemblyMachineTier}`,
        layout: {
          x: BOX_PADDING + BOX_CONTENT_PADDING + BUTTON_PADDING,
          y:
            BOX_PADDING +
            headerHeight +
            BOX_CONTENT_MARGIN +
            BOX_CONTENT_PADDING +
            productionLineMeasures.height +
            lineMargin(BODY_FONT) +
            craftingTimeMeasures.height +
            lineMargin(BODY_FONT) +
            assemblerLineHeight / 2 -
            (BUTTON_PADDING * 2 + ICON_SIZE) / 2 +
            BUTTON_PADDING,
          width: ICON_SIZE,
          height: ICON_SIZE,
        },
      },
      {
        type: "text",
        text: assemblersRequired,
        font: computedFonts.body,
        color: TEXT_COLOR,
        baseline: assemblersRequiredMeasures.baseline,
        layout: {
          x:
            BOX_PADDING +
            BOX_CONTENT_PADDING +
            BUTTON_PADDING * 2 +
            ICON_SIZE +
            BUTTON_MARGIN,
          y:
            BOX_PADDING +
            headerHeight +
            BOX_CONTENT_MARGIN +
            BOX_CONTENT_PADDING +
            productionLineMeasures.height +
            lineMargin(BODY_FONT) +
            craftingTimeMeasures.height +
            lineMargin(BODY_FONT) +
            assemblerLineHeight / 2 -
            assemblersRequiredMeasures.height / 2,
          width: assemblersRequiredMeasures.width,
          height: assemblersRequiredMeasures.height,
        },
      },
    ],
  }
}

export function terminalBox(
  ctx: CanvasRenderingContext2D,
  itemName: string,
  requiredAmount: number,
): LayoutResult {
  const name = t(itemName) ?? itemName
  const nameMeasures = text(ctx, name, computedFonts.title)

  const requiredAmountText = `${numberFormat.format(requiredAmount)}/s`
  const requiredAmountMeasures = text(
    ctx,
    requiredAmountText,
    computedFonts.requiredAmount,
  )

  const lineHeight = Math.max(
    nameMeasures.height,
    requiredAmountMeasures.height,
    ICON_SIZE,
  )

  const bbox = {
    width:
      BOX_PADDING * 2 +
      ICON_SIZE +
      ICON_MARGIN +
      nameMeasures.width +
      REQUIRED_AMOUNT_MARGIN +
      requiredAmountMeasures.width,
    height: BOX_PADDING * 2 + lineHeight,
  }

  return {
    bbox,
    contents: [
      {
        type: "box",
        bg: BOX_BG,
        layout: {
          x: 0,
          y: 0,
          width: bbox.width,
          height: bbox.height,
        },
      },
      {
        type: "icon",
        name: itemName,
        layout: {
          x: BOX_PADDING,
          y: BOX_PADDING + lineHeight / 2 - ICON_SIZE / 2,
          width: ICON_SIZE,
          height: ICON_SIZE,
        },
      },
      {
        type: "text",
        text: name,
        font: computedFonts.title,
        color: TITLE_COLOR,
        baseline: nameMeasures.baseline,
        layout: {
          x: BOX_PADDING + ICON_SIZE + ICON_MARGIN,
          y: BOX_PADDING + lineHeight / 2 - nameMeasures.height / 2,
          width: nameMeasures.width,
          height: nameMeasures.height,
        },
      },
      {
        type: "text",
        text: requiredAmountText,
        font: computedFonts.requiredAmount,
        color: REQUIRED_AMOUNT_COLOR,
        baseline: requiredAmountMeasures.baseline,
        layout: {
          x:
            BOX_PADDING +
            ICON_SIZE +
            ICON_MARGIN +
            nameMeasures.width +
            REQUIRED_AMOUNT_MARGIN,
          y: BOX_PADDING,
          width: requiredAmountMeasures.width,
          height: requiredAmountMeasures.height,
        },
      },
    ],
  }
}

export function node(ctx: CanvasRenderingContext2D, node: RecipeNode) {
  switch (node.type) {
    case "root":
      return rootBox(ctx, node)
    case "terminal":
      return terminalBox(ctx, node.itemName, node.requiredAmount)
  }
}
