<h1>Circular Select</h1>
<p>Custom looking circular select with circular options. The options are opened with an animation effect and have different background color blending from the first option to the last one. The text inside is aligned with the circular bottom edge of the option. </p> 

<h2>Dependencies</h2>
1. [https://github.com/dirkweber/csswarp.js]Css warp plugin for aligning text along a curve.
2. [https://github.com/brehaut/color-js]Color-js plugin for working with hsl color model. 
3. [https://jqueryui.com/easing/]jQuery UI Easing. 

<h2>Usage</h2>
<p>Include dependency sources in your page: </p>

```html
<script src="js/jquery-2.1.4.min.js"></script>
<script src="js/jquery-ui.easing.min.js"></script>
<script src="js/dependent/color.js"></script>
<script src="js/dependent/csswarp.0.7.min.js"></script>
<script src="../dist/jquery.circularSelect.min.js"></script>
```

<p>Then, choose a select to apply a plugin for.</p>
<pre>
$("select").circularSelect({
	dropdownOptionWidth:"auto",
	choiceWidth:"auto",
	adjuster:50
});
</pre>
<p>Adjust plugin options as necessary.</p>
