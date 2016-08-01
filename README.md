### Expaus

###### Prerequest

* nodejs 
	<pre><code>sudo apt-get install nodejs</code></pre>
* npm
	<pre><code>sudo apt-get install npm</code></pre>
* bower
	<pre><code>sudo npm install -g bower</code></pre>
* gulp
	<pre><code>sudo npm install -g gulp</code></pre>
	

###### Setup development environment 

1. Checkout codebase from github
2. Go to the project root directory
3. Install node packages and bower components
	<pre><code>sudo npm install</code></pre>
	<pre><code>sudo bower install --allow-root</code></pre>
4. Install gulp in your project devDependencies
	<pre><code>sudo npm install --save-dev gulp</code></pre>


###### Run gulp
1. Run gulp to work on devolopment.
	<pre><code>sudo gulp watch-dev</code></pre>



