# Quick Start Guide - Palco Timewarp

Get your stage visualizer running in 5 minutes!

## Step 1: Start a Local Server

Choose the easiest method for you:

### Using Python (Recommended - No Installation Needed)

**Windows:**
```bash
python -m http.server 8000
```

**Mac/Linux:**
```bash
python3 -m http.server 8000
```

### Using VS Code (If you use VS Code)

1. Install "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

### Using Node.js

```bash
npx http-server -p 8000
```

## Step 2: Open in Browser

Open your browser and go to:
```
http://localhost:8000
```

## Step 3: Wait for Loading

The stage model (1.glb) will load - this may take a few seconds since it's ~60MB.

## Step 4: Explore!

### Navigation
- **Drag with left mouse**: Rotate camera
- **Drag with right mouse**: Pan view
- **Mouse wheel**: Zoom in/out

### Try These Features
1. **Toggle Elements** - Turn scaffolding, LEDs, lasers on/off in the left panel
2. **Animate Effects** - Check "Animate Lasers" and "Animate Strobes"
3. **Camera Views** - Click "Top View", "Front View", "Side View" buttons
4. **Adjust Lighting** - Move the intensity sliders

## What You'll See

- ✅ Your original GLB stage model
- ✅ Scaffolding truss structure around the stage
- ✅ 19 LED panels (back wall + sides) with color cycling
- ✅ 6 laser systems with animated beams
- ✅ 10 strobe lights on the top truss
- ✅ 8 P5 moving head spotlights

## Troubleshooting

**Model not loading?**
- Make sure you're running a web server (can't just open index.html directly)
- Check that `assets/1.glb` exists

**Slow performance?**
- Uncheck "Animate Lasers" and "Animate Strobes"
- Close other browser tabs

**Black screen?**
- Check browser console (press F12)
- Make sure WebGL is enabled in your browser

## Next Steps

Now you're ready to iterate! You can:

1. **Provide reference images** - Show me photos/sketches of your desired stage setup
2. **Adjust elements** - Tell me to move, resize, or reconfigure any element
3. **Add new features** - Request additional stage elements or effects
4. **Export setup** - Click "Export Configuration" to save your design

## Need Help?

The full documentation is in `README.md`. Check there for:
- Detailed customization instructions
- Code structure explanation
- Performance optimization tips
- Browser compatibility info

---

**Ready to build your stage? Let's go! 🎪✨**