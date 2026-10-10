import AppKit
import Foundation

let fm = FileManager.default
let sourceDirectory = URL(fileURLWithPath: "assets/wallpapers", isDirectory: true)
let outputDirectory = sourceDirectory.appendingPathComponent("social-samples", isDirectory: true)
try? fm.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let names = [
  "terrain-studies-01-dune-iphone.png", "terrain-studies-02-ridge-iphone.png",
  "terrain-studies-03-tide-iphone.png", "terrain-studies-04-stone-iphone.png",
  "terrain-studies-05-moon-iphone.png", "terrain-studies-06-fog-iphone.png",
  "minimal-wallpaper-01-iphone.png", "minimal-wallpaper-02-iphone.png",
  "minimal-wallpaper-03-iphone.png", "minimal-wallpaper-04-iphone.png"
]

func text(_ value: String, size: CGFloat, color: NSColor) -> NSAttributedString {
  NSAttributedString(string: value, attributes: [
    .font: NSFont.systemFont(ofSize: size, weight: .bold),
    .foregroundColor: color,
    .kern: size * 0.08
  ])
}

for name in names {
  let input = sourceDirectory.appendingPathComponent(name)
  guard let original = NSImage(contentsOf: input), original.size.width > 0 else { continue }
  let width: CGFloat = 540
  let height = width * original.size.height / original.size.width
  let output = NSImage(size: NSSize(width: width, height: height))
  output.lockFocus()
  NSGraphicsContext.current?.imageInterpolation = .medium
  original.draw(in: NSRect(x: 0, y: 0, width: width, height: height), from: NSRect(origin: .zero, size: original.size), operation: .copy, fraction: 1)

  // A pale veil makes this visibly a preview even if saved.
  NSColor(white: 1, alpha: 0.18).setFill()
  NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: height)).fill()

  let context = NSGraphicsContext.current!.cgContext
  context.saveGState()
  context.translateBy(x: width / 2, y: height / 2)
  context.rotate(by: -CGFloat.pi / 7)
  for y in stride(from: -height, through: height, by: height / 4) {
    let mark = text("SAMPLE", size: 70, color: NSColor(white: 0.05, alpha: 0.52))
    mark.draw(at: NSPoint(x: -width * 0.42, y: y))
  }
  context.restoreGState()

  let label = "PREVIEW ONLY  •  FULL-RES FILE AFTER PURCHASE"
  let labelText = text(label, size: 12, color: .white)
  let labelSize = labelText.size()
  NSColor(white: 0.05, alpha: 0.82).setFill()
  NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: 38)).fill()
  labelText.draw(at: NSPoint(x: (width - labelSize.width) / 2, y: 12))
  output.unlockFocus()

  guard let data = output.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: data),
        let png = bitmap.representation(using: .png, properties: [:]) else { continue }
  let stem = input.deletingPathExtension().lastPathComponent
  try png.write(to: outputDirectory.appendingPathComponent("\(stem)-sample.png"))
}
