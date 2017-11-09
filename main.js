
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				return _elm_lang$core$Json_Decode$succeed(fallback);
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom$blur = _elm_lang$dom$Native_Dom.blur;
var _elm_lang$dom$Dom$focus = _elm_lang$dom$Native_Dom.focus;
var _elm_lang$dom$Dom$NotFound = function (a) {
	return {ctor: 'NotFound', _0: a};
};

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$dom$Dom_Size$width = _elm_lang$dom$Native_Dom.width;
var _elm_lang$dom$Dom_Size$height = _elm_lang$dom$Native_Dom.height;
var _elm_lang$dom$Dom_Size$VisibleContentWithBordersAndMargins = {ctor: 'VisibleContentWithBordersAndMargins'};
var _elm_lang$dom$Dom_Size$VisibleContentWithBorders = {ctor: 'VisibleContentWithBorders'};
var _elm_lang$dom$Dom_Size$VisibleContent = {ctor: 'VisibleContent'};
var _elm_lang$dom$Dom_Size$Content = {ctor: 'Content'};

var _elm_lang$dom$Dom_Scroll$toX = _elm_lang$dom$Native_Dom.setScrollLeft;
var _elm_lang$dom$Dom_Scroll$x = _elm_lang$dom$Native_Dom.getScrollLeft;
var _elm_lang$dom$Dom_Scroll$toRight = _elm_lang$dom$Native_Dom.toRight;
var _elm_lang$dom$Dom_Scroll$toLeft = function (id) {
	return A2(_elm_lang$dom$Dom_Scroll$toX, id, 0);
};
var _elm_lang$dom$Dom_Scroll$toY = _elm_lang$dom$Native_Dom.setScrollTop;
var _elm_lang$dom$Dom_Scroll$y = _elm_lang$dom$Native_Dom.getScrollTop;
var _elm_lang$dom$Dom_Scroll$toBottom = _elm_lang$dom$Native_Dom.toBottom;
var _elm_lang$dom$Dom_Scroll$toTop = function (id) {
	return A2(_elm_lang$dom$Dom_Scroll$toY, id, 0);
};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$html$Html_Lazy$lazy3 = _elm_lang$virtual_dom$VirtualDom$lazy3;
var _elm_lang$html$Html_Lazy$lazy2 = _elm_lang$virtual_dom$VirtualDom$lazy2;
var _elm_lang$html$Html_Lazy$lazy = _elm_lang$virtual_dom$VirtualDom$lazy;

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _ezacharias$sftm$Term$parens = F3(
	function (i, j, s) {
		return (_elm_lang$core$Native_Utils.cmp(0, j) < 0) ? A2(
			_elm_lang$core$Basics_ops['++'],
			'(',
			A2(_elm_lang$core$Basics_ops['++'], s, ')')) : s;
	});
var _ezacharias$sftm$Term$reallyTex = F2(
	function (p, term) {
		var _p0 = term;
		switch (_p0.ctor) {
			case 'Atom':
				switch (_p0._0.ctor) {
					case 'Top':
						return '\\top';
					case 'Bot':
						return '\\bot';
					case 'VarA':
						return 'A';
					case 'VarB':
						return 'B';
					case 'VarC':
						return 'C';
					default:
						switch (_p0._0._0.ctor) {
							case 'MetaA':
								return '\\frak{A}';
							case 'MetaB':
								return '\\frak{B}';
							default:
								return '\\frak{C}';
						}
				}
			case 'Unary':
				return A3(
					_ezacharias$sftm$Term$parens,
					5,
					p,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'\\lnot ',
						A2(_ezacharias$sftm$Term$reallyTex, 5, _p0._1)));
			default:
				switch (_p0._0.ctor) {
					case 'Conjunction':
						return A3(
							_ezacharias$sftm$Term$parens,
							4,
							p,
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(_ezacharias$sftm$Term$reallyTex, 4, _p0._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' \\land ',
									A2(_ezacharias$sftm$Term$reallyTex, 4, _p0._2))));
					case 'Disjunction':
						return A3(
							_ezacharias$sftm$Term$parens,
							3,
							p,
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(_ezacharias$sftm$Term$reallyTex, 3, _p0._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' \\lor ',
									A2(_ezacharias$sftm$Term$reallyTex, 3, _p0._2))));
					case 'Implication':
						return A3(
							_ezacharias$sftm$Term$parens,
							2,
							p,
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(_ezacharias$sftm$Term$reallyTex, 2, _p0._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' \\to ',
									A2(_ezacharias$sftm$Term$reallyTex, 2, _p0._2))));
					default:
						return A3(
							_ezacharias$sftm$Term$parens,
							1,
							p,
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(_ezacharias$sftm$Term$reallyTex, 1, _p0._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' \\leftrightarrow ',
									A2(_ezacharias$sftm$Term$reallyTex, 1, _p0._2))));
				}
		}
	});
var _ezacharias$sftm$Term$tex = _ezacharias$sftm$Term$reallyTex(0);
var _ezacharias$sftm$Term$addMetavariables = F2(
	function (term, dict) {
		addMetavariables:
		while (true) {
			var f = F2(
				function (a1, d) {
					var _p1 = d;
					if (_p1.ctor === '[]') {
						return {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: a1,
								_1: {ctor: '[]'}
							},
							_1: {ctor: '[]'}
						};
					} else {
						var _p4 = _p1._0._1;
						var _p3 = _p1._1;
						var _p2 = _p1._0._0;
						return _elm_lang$core$Native_Utils.eq(a1, _p2) ? {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p2, _1: _p4},
							_1: _p3
						} : {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p2, _1: _p4},
							_1: A2(f, a1, _p3)
						};
					}
				});
			var _p5 = term;
			switch (_p5.ctor) {
				case 'Atom':
					if (_p5._0.ctor === 'MetaVar') {
						return A2(f, _p5._0._0, dict);
					} else {
						return dict;
					}
				case 'Unary':
					var _v3 = _p5._1,
						_v4 = dict;
					term = _v3;
					dict = _v4;
					continue addMetavariables;
				default:
					var _v5 = _p5._2,
						_v6 = A2(_ezacharias$sftm$Term$addMetavariables, _p5._1, dict);
					term = _v5;
					dict = _v6;
					continue addMetavariables;
			}
		}
	});
var _ezacharias$sftm$Term$encoder = function (term) {
	var _p6 = term;
	switch (_p6.ctor) {
		case 'Atom':
			switch (_p6._0.ctor) {
				case 'Top':
					return _elm_lang$core$Json_Encode$string('top');
				case 'Bot':
					return _elm_lang$core$Json_Encode$string('bot');
				case 'VarA':
					return _elm_lang$core$Json_Encode$string('var-a');
				case 'VarB':
					return _elm_lang$core$Json_Encode$string('var-b');
				case 'VarC':
					return _elm_lang$core$Json_Encode$string('var-c');
				default:
					switch (_p6._0._0.ctor) {
						case 'MetaA':
							return _elm_lang$core$Json_Encode$string('meta-a');
						case 'MetaB':
							return _elm_lang$core$Json_Encode$string('meta-b');
						default:
							return _elm_lang$core$Json_Encode$string('meta-c');
					}
			}
		case 'Unary':
			return _elm_lang$core$Json_Encode$list(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Encode$string('not'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Term$encoder(_p6._1),
						_1: {ctor: '[]'}
					}
				});
		default:
			switch (_p6._0.ctor) {
				case 'Conjunction':
					return _elm_lang$core$Json_Encode$list(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Encode$string('and'),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Term$encoder(_p6._1),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Term$encoder(_p6._2),
									_1: {ctor: '[]'}
								}
							}
						});
				case 'Disjunction':
					return _elm_lang$core$Json_Encode$list(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Encode$string('or'),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Term$encoder(_p6._1),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Term$encoder(_p6._2),
									_1: {ctor: '[]'}
								}
							}
						});
				case 'Implication':
					return _elm_lang$core$Json_Encode$list(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Encode$string('implies'),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Term$encoder(_p6._1),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Term$encoder(_p6._2),
									_1: {ctor: '[]'}
								}
							}
						});
				default:
					return _elm_lang$core$Json_Encode$list(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Encode$string('equivalent'),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Term$encoder(_p6._1),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Term$encoder(_p6._2),
									_1: {ctor: '[]'}
								}
							}
						});
			}
	}
};
var _ezacharias$sftm$Term$Binary = F3(
	function (a, b, c) {
		return {ctor: 'Binary', _0: a, _1: b, _2: c};
	});
var _ezacharias$sftm$Term$Unary = F2(
	function (a, b) {
		return {ctor: 'Unary', _0: a, _1: b};
	});
var _ezacharias$sftm$Term$Atom = function (a) {
	return {ctor: 'Atom', _0: a};
};
var _ezacharias$sftm$Term$Equivalence = {ctor: 'Equivalence'};
var _ezacharias$sftm$Term$Implication = {ctor: 'Implication'};
var _ezacharias$sftm$Term$Disjunction = {ctor: 'Disjunction'};
var _ezacharias$sftm$Term$Conjunction = {ctor: 'Conjunction'};
var _ezacharias$sftm$Term$Not = {ctor: 'Not'};
var _ezacharias$sftm$Term$MetaVar = function (a) {
	return {ctor: 'MetaVar', _0: a};
};
var _ezacharias$sftm$Term$occupyEntry = function (_p7) {
	var _p8 = _p7;
	var _p11 = _p8._1;
	var _p10 = _p8._0;
	var _p9 = _p11;
	if (_p9.ctor === '[]') {
		return {
			ctor: '_Tuple2',
			_0: _p10,
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Term$Atom(
					_ezacharias$sftm$Term$MetaVar(_p10)),
				_1: {ctor: '[]'}
			}
		};
	} else {
		return {ctor: '_Tuple2', _0: _p10, _1: _p11};
	}
};
var _ezacharias$sftm$Term$occupy = _elm_lang$core$List$map(_ezacharias$sftm$Term$occupyEntry);
var _ezacharias$sftm$Term$VarC = {ctor: 'VarC'};
var _ezacharias$sftm$Term$VarB = {ctor: 'VarB'};
var _ezacharias$sftm$Term$VarA = {ctor: 'VarA'};
var _ezacharias$sftm$Term$Bot = {ctor: 'Bot'};
var _ezacharias$sftm$Term$Top = {ctor: 'Top'};
var _ezacharias$sftm$Term$MetaC = {ctor: 'MetaC'};
var _ezacharias$sftm$Term$MetaB = {ctor: 'MetaB'};
var _ezacharias$sftm$Term$MetaA = {ctor: 'MetaA'};
var _ezacharias$sftm$Term$decoder = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: A2(
			_elm_lang$core$Json_Decode$andThen,
			function (s) {
				var _p12 = s;
				switch (_p12) {
					case 'top':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top));
					case 'bot':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot));
					case 'var-a':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA));
					case 'var-b':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB));
					case 'var-c':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC));
					case 'meta-a':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(
								_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)));
					case 'meta-b':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(
								_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)));
					case 'meta-c':
						return _elm_lang$core$Json_Decode$succeed(
							_ezacharias$sftm$Term$Atom(
								_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)));
					default:
						return _elm_lang$core$Json_Decode$fail('term');
				}
			},
			_elm_lang$core$Json_Decode$string),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$andThen,
				function (s) {
					var _p13 = s;
					switch (_p13) {
						case 'not':
							return A2(
								_elm_lang$core$Json_Decode$map,
								_ezacharias$sftm$Term$Unary(_ezacharias$sftm$Term$Not),
								A2(_elm_lang$core$Json_Decode$index, 1, _ezacharias$sftm$Term$decoder));
						case 'and':
							return A3(
								_elm_lang$core$Json_Decode$map2,
								_ezacharias$sftm$Term$Binary(_ezacharias$sftm$Term$Conjunction),
								A2(_elm_lang$core$Json_Decode$index, 1, _ezacharias$sftm$Term$decoder),
								A2(_elm_lang$core$Json_Decode$index, 2, _ezacharias$sftm$Term$decoder));
						case 'or':
							return A3(
								_elm_lang$core$Json_Decode$map2,
								_ezacharias$sftm$Term$Binary(_ezacharias$sftm$Term$Disjunction),
								A2(_elm_lang$core$Json_Decode$index, 1, _ezacharias$sftm$Term$decoder),
								A2(_elm_lang$core$Json_Decode$index, 2, _ezacharias$sftm$Term$decoder));
						case 'implies':
							return A3(
								_elm_lang$core$Json_Decode$map2,
								_ezacharias$sftm$Term$Binary(_ezacharias$sftm$Term$Implication),
								A2(_elm_lang$core$Json_Decode$index, 1, _ezacharias$sftm$Term$decoder),
								A2(_elm_lang$core$Json_Decode$index, 2, _ezacharias$sftm$Term$decoder));
						case 'equivalent':
							return A3(
								_elm_lang$core$Json_Decode$map2,
								_ezacharias$sftm$Term$Binary(_ezacharias$sftm$Term$Equivalence),
								A2(_elm_lang$core$Json_Decode$index, 1, _ezacharias$sftm$Term$decoder),
								A2(_elm_lang$core$Json_Decode$index, 2, _ezacharias$sftm$Term$decoder));
						default:
							return _elm_lang$core$Json_Decode$fail('term');
					}
				},
				A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)),
			_1: {ctor: '[]'}
		}
	});

var _ezacharias$sftm$Graphics$delete = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('28px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('28px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 28 28'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$circle,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill('Crimson'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cx('14'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cy('14'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$r('12'),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$path,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth('1.5'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M8 8L20 20M8 20L20 8'),
							_1: {ctor: '[]'}
						}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		}
	});
var _ezacharias$sftm$Graphics$lowerArrow = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 40 40'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('#E0E0E0'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$style('position: relative; top: 5px;'),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth('10'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M39 20L28 14L33 19L13 19L10 16L6 16L9 19L8 19L5 16L1 16L5 20L1 24L5 24L8 21L9 21L6 24L10 24L13 21L33 21L28 26Z'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Graphics$target = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 40 40'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$circle,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill('#F0D0D0'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cx('20'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cy('20'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$r('3'),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$circle,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke('#E0E0E0'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth('2'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cx('20'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$cy('20'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$r('7'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$stroke('#E0E0E0'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeWidth('2'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$cx('20'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$cy('20'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$r('12'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			}
		}
	});
var _ezacharias$sftm$Graphics$arrow = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 40 40'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('#E0E0E0'),
						_1: {ctor: '[]'}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth('10'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M39 20L28 14L33 19L13 19L10 16L6 16L9 19L8 19L5 16L1 16L5 20L1 24L5 24L8 21L9 21L6 24L10 24L13 21L33 21L28 26Z'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Graphics$dashedTombstone = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 200 200'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('#CFCFCF'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeDasharray('0 28'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth('10'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M56 30L140 30L140 170L56 170Z'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Graphics$whiteTombstone = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 200 200'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth('15'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M56 30L140 30L140 170L56 170Z'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Graphics$lowerWhiteTombstone = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'transform: scale(1,-1);',
				A2(_elm_lang$core$Basics_ops['++'], 'position: relative;', 'top: 3px;'))),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 200 200'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$desc,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg$text('Tombstone'),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$path,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$strokeWidth('15'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M56 30L140 30L140 170L56 170Z'),
						_1: {ctor: '[]'}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		}
	});
var _ezacharias$sftm$Graphics$leftAngle = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('20px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('20px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 200 200'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth('20'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M120 40L80 100L120 160'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Graphics$upDownArrows = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('16px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('16px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 160 160'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('White'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$d('M80 20L120 60L40 60Z'),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$path,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d('M80 140L120 100L40 100Z'),
					_1: {ctor: '[]'}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		}
	});
var _ezacharias$sftm$Graphics$dots3 = A2(
	_elm_lang$svg$Svg$svg,
	{
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('16px'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('16px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 160 160'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('White'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$svg$Svg$circle,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$cx('80'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cy('30'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$r('15'),
						_1: {ctor: '[]'}
					}
				}
			},
			{ctor: '[]'}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$circle,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cx('80'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cy('80'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$r('15'),
							_1: {ctor: '[]'}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx('80'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy('130'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r('15'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			}
		}
	});
var _ezacharias$sftm$Graphics$circle = function (color) {
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('16px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('16px'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 160 160'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$circle,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cx('80'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cy('80'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$r('30'),
							_1: {ctor: '[]'}
						}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Graphics$ring = function (color) {
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$style('transform: scale(1,-1);'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('16px'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('16px'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 160 160'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill('none'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$circle,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$strokeWidth('20'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx('80'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy('80'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r('60'),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		});
};

var _ezacharias$sftm$Symbol$Implication = {ctor: 'Implication'};
var _ezacharias$sftm$Symbol$Equivalence = {ctor: 'Equivalence'};
var _ezacharias$sftm$Symbol$Disjunction = {ctor: 'Disjunction'};
var _ezacharias$sftm$Symbol$Conjunction = {ctor: 'Conjunction'};
var _ezacharias$sftm$Symbol$Negation = {ctor: 'Negation'};
var _ezacharias$sftm$Symbol$VarC = {ctor: 'VarC'};
var _ezacharias$sftm$Symbol$VarB = {ctor: 'VarB'};
var _ezacharias$sftm$Symbol$VarA = {ctor: 'VarA'};
var _ezacharias$sftm$Symbol$Bot = {ctor: 'Bot'};
var _ezacharias$sftm$Symbol$Top = {ctor: 'Top'};

var _ezacharias$sftm$Utilities$ariaHidden = function (b) {
	return b ? A2(_elm_lang$html$Html_Attributes$attribute, 'aria-hidden', 'true') : A2(_elm_lang$html$Html_Attributes$attribute, 'aria-hidden', 'false');
};
var _ezacharias$sftm$Utilities$unsafeTail = function (xs) {
	var _p0 = xs;
	if (_p0.ctor === '[]') {
		return _elm_lang$core$Native_Utils.crashCase(
			'Utilities',
			{
				start: {line: 78, column: 5},
				end: {line: 83, column: 14}
			},
			_p0)('impossible');
	} else {
		return _p0._1;
	}
};
var _ezacharias$sftm$Utilities$scrollToBottomCmd = function (msg) {
	return A2(
		_elm_lang$core$Task$attempt,
		function (result) {
			return msg;
		},
		_elm_lang$dom$Dom_Scroll$toBottom('scrolling'));
};
var _ezacharias$sftm$Utilities$scrollToTopCmd = function (msg) {
	return A2(
		_elm_lang$core$Task$attempt,
		function (result) {
			return msg;
		},
		_elm_lang$dom$Dom_Scroll$toTop('scrolling'));
};
var _ezacharias$sftm$Utilities$onScroll = function (f) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'scroll',
		_elm_lang$core$Json_Decode$succeed(f));
};
var _ezacharias$sftm$Utilities$remove = F2(
	function (n, xs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$List$take, n, xs),
			A2(_elm_lang$core$List$drop, n + 1, xs));
	});
var _ezacharias$sftm$Utilities$fromJust = function (m) {
	var _p2 = m;
	if (_p2.ctor === 'Nothing') {
		return _elm_lang$core$Native_Utils.crashCase(
			'Utilities',
			{
				start: {line: 48, column: 5},
				end: {line: 53, column: 14}
			},
			_p2)('impossible');
	} else {
		return _p2._0;
	}
};
var _ezacharias$sftm$Utilities$isNothing = function (m) {
	var _p4 = m;
	if (_p4.ctor === 'Nothing') {
		return true;
	} else {
		return false;
	}
};
var _ezacharias$sftm$Utilities$set = F3(
	function (i, x, xs) {
		return A2(
			_elm_lang$core$List$append,
			A2(_elm_lang$core$List$take, i, xs),
			{
				ctor: '::',
				_0: x,
				_1: A2(_elm_lang$core$List$drop, i + 1, xs)
			});
	});
var _ezacharias$sftm$Utilities$unsafeGet = F2(
	function (i, xs) {
		var _p5 = _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, i, xs));
		if (_p5.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.crashCase(
				'Utilities',
				{
					start: {line: 23, column: 5},
					end: {line: 28, column: 14}
				},
				_p5)('impossible');
		} else {
			return _p5._0;
		}
	});
var _ezacharias$sftm$Utilities$get = F2(
	function (i, xs) {
		return _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, i, xs));
	});
var _ezacharias$sftm$Utilities$castHtml = _elm_lang$html$Html$map(_elm_lang$core$Basics$never);

var _ezacharias$sftm$Path$pathNodeEncoder = function (x) {
	var _p0 = x;
	if (_p0.ctor === 'GoLeft') {
		return _elm_lang$core$Json_Encode$string('left');
	} else {
		return _elm_lang$core$Json_Encode$string('right');
	}
};
var _ezacharias$sftm$Path$encoder = function (path) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _ezacharias$sftm$Path$pathNodeEncoder, path));
};
var _ezacharias$sftm$Path$out = function (p) {
	return _elm_lang$core$List$reverse(
		_ezacharias$sftm$Utilities$unsafeTail(
			_elm_lang$core$List$reverse(p)));
};
var _ezacharias$sftm$Path$GoRight = {ctor: 'GoRight'};
var _ezacharias$sftm$Path$right = function (p) {
	return _elm_lang$core$List$reverse(
		A2(
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_ezacharias$sftm$Path$GoRight,
			_elm_lang$core$List$reverse(p)));
};
var _ezacharias$sftm$Path$GoLeft = {ctor: 'GoLeft'};
var _ezacharias$sftm$Path$left = function (p) {
	return _elm_lang$core$List$reverse(
		A2(
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_ezacharias$sftm$Path$GoLeft,
			_elm_lang$core$List$reverse(p)));
};
var _ezacharias$sftm$Path$decoder = function () {
	var $continue = function (s) {
		var _p1 = s;
		switch (_p1) {
			case 'left':
				return _elm_lang$core$Json_Decode$succeed(_ezacharias$sftm$Path$GoLeft);
			case 'right':
				return _elm_lang$core$Json_Decode$succeed(_ezacharias$sftm$Path$GoRight);
			default:
				return _elm_lang$core$Json_Decode$fail('path');
		}
	};
	return _elm_lang$core$Json_Decode$list(
		A2(_elm_lang$core$Json_Decode$andThen, $continue, _elm_lang$core$Json_Decode$string));
}();

var _ezacharias$sftm$Rule$reverse = function (rule) {
	return _elm_lang$core$Native_Utils.update(
		rule,
		{left: rule.right, right: rule.left});
};
var _ezacharias$sftm$Rule$reverseIf = F2(
	function (b, rule) {
		return b ? _ezacharias$sftm$Rule$reverse(rule) : rule;
	});
var _ezacharias$sftm$Rule$Rule = F5(
	function (a, b, c, d, e) {
		return {name: a, isSymmetric: b, antecedents: c, left: d, right: e};
	});

var _ezacharias$sftm$Transformation$Transformation = F4(
	function (a, b, c, d) {
		return {display: a, isMultiple: b, isReversed: c, ruleIndex: d};
	});

var _ezacharias$sftm$MathML$mo = _elm_lang$html$Html$node('mo');
var _ezacharias$sftm$MathML$mi = _elm_lang$html$Html$node('mi');
var _ezacharias$sftm$MathML$math = function (attrs) {
	return A2(
		_elm_lang$html$Html$node,
		'math',
		{
			ctor: '::',
			_0: A2(_elm_lang$html$Html_Attributes$attribute, 'xmlns', 'http://www.w3.org/1998/Math/MathML'),
			_1: attrs
		});
};

var _ezacharias$sftm$MathML_Attributes$mathvariant = _elm_lang$html$Html_Attributes$attribute('mathvariant');

var _ezacharias$sftm$Render$raiseY = 90;
var _ezacharias$sftm$Render$midline = 250 + _ezacharias$sftm$Render$raiseY;
var _ezacharias$sftm$Render$shapeRect = function (shape) {
	var _p0 = {ctor: '_Tuple2', _0: shape.focus, _1: shape.assoc};
	if (_p0._0.ctor === 'Nothing') {
		if (_p0._1.ctor === 'Nothing') {
			return {x: 0.0, y: 0.0, width: shape.width, above: shape.above, below: shape.below};
		} else {
			return _p0._1._0;
		}
	} else {
		if (_p0._1.ctor === 'Nothing') {
			return _p0._0._0;
		} else {
			var _p2 = _p0._1._0;
			var _p1 = _p0._0._0;
			var centerX = _p1.x + (_p1.width / 2);
			var halfWidth = A2(
				_elm_lang$core$Basics$max,
				A2(_elm_lang$core$Basics$max, (_p1.x + _p1.width) - centerX, (_p2.x + _p2.width) - centerX),
				A2(_elm_lang$core$Basics$max, centerX - _p1.x, centerX - _p2.x));
			return {
				x: centerX - halfWidth,
				y: _p1.y,
				width: halfWidth * 2,
				above: A2(_elm_lang$core$Basics$max, _p1.above, (_p2.above + _p2.y) - _p1.y),
				below: A2(_elm_lang$core$Basics$max, _p2.below, (_p2.below + _p1.y) - _p2.y)
			};
		}
	}
};
var _ezacharias$sftm$Render$frakturCGlyph = {id: '#MJFRAK-43', ascent: 685, descent: 24, width: 613, xStart: 59, xEnd: 607};
var _ezacharias$sftm$Render$frakturBGlyph = {id: '#MJFRAK-42', ascent: 691, descent: 27, width: 884, xStart: 48, xEnd: 820};
var _ezacharias$sftm$Render$frakturAGlyph = {id: '#MJFRAK-41', ascent: 696, descent: 26, width: 718, xStart: 22, xEnd: 707};
var _ezacharias$sftm$Render$starGlyph = {id: '#MJAMS-2605', ascent: 694, descent: 111, width: 944, xStart: 49, xEnd: 895};
var _ezacharias$sftm$Render$commaGlyph = {id: '#MJMAIN-2C', ascent: 121, descent: 195, width: 278, xStart: 78, xEnd: 210};
var _ezacharias$sftm$Render$translateGlyph = F3(
	function (x, y, g) {
		return _elm_lang$core$Native_Utils.update(
			g,
			{ascent: g.ascent + y, descent: g.descent - y, xStart: g.xStart + x, xEnd: g.xEnd + x});
	});
var _ezacharias$sftm$Render$latinUpperAGlyph = A3(
	_ezacharias$sftm$Render$translateGlyph,
	-40,
	0,
	{id: '#MJMATHI-41', ascent: 716, descent: 0, width: 743, xStart: 58, xEnd: 696});
var _ezacharias$sftm$Render$latinUpperBGlyph = A3(
	_ezacharias$sftm$Render$translateGlyph,
	-40,
	0,
	{id: '#MJMATHI-42', ascent: 683, descent: 0, width: 704, xStart: 57, xEnd: 732});
var _ezacharias$sftm$Render$latinUpperCGlyph = A3(
	_ezacharias$sftm$Render$translateGlyph,
	-40,
	0,
	{id: '#MJMATHI-43', ascent: 705, descent: 21, width: 716, xStart: 150, xEnd: 812});
var _ezacharias$sftm$Render$metaColor = 'Orchid';
var _ezacharias$sftm$Render$nonFocusColor = 'SlateGrey';
var _ezacharias$sftm$Render$assocColor = 'Yellow';
var _ezacharias$sftm$Render$focusColor = 'White';
var _ezacharias$sftm$Render$contextIsTrueAssoc = function (c) {
	var _p3 = c.assocPosition;
	switch (_p3.ctor) {
		case 'Path':
			if (_p3._0.ctor === '[]') {
				return true;
			} else {
				return false;
			}
		case 'Inside':
			return false;
		default:
			return false;
	}
};
var _ezacharias$sftm$Render$contextIsTrueFocus = function (c) {
	var _p4 = c.focusPosition;
	switch (_p4.ctor) {
		case 'Path':
			if (_p4._0.ctor === '[]') {
				return true;
			} else {
				return false;
			}
		case 'Inside':
			return false;
		default:
			return false;
	}
};
var _ezacharias$sftm$Render$contextIsFocus = function (c) {
	var _p5 = c.focusPosition;
	switch (_p5.ctor) {
		case 'Path':
			if (_p5._0.ctor === '[]') {
				return true;
			} else {
				return false;
			}
		case 'Inside':
			return true;
		default:
			return false;
	}
};
var _ezacharias$sftm$Render$ifFocus = F2(
	function (ctx, m) {
		return _ezacharias$sftm$Render$contextIsFocus(ctx) ? m : {ctor: '[]'};
	});
var _ezacharias$sftm$Render$contextIsMathML = function (c) {
	var _p6 = c.focusPosition;
	switch (_p6.ctor) {
		case 'Path':
			if (_p6._0.ctor === '[]') {
				return true;
			} else {
				return true;
			}
		case 'Inside':
			return true;
		default:
			return false;
	}
};
var _ezacharias$sftm$Render$translateRectY = function (y) {
	return _elm_lang$core$Maybe$map(
		function (r) {
			return _elm_lang$core$Native_Utils.update(
				r,
				{y: r.y + y});
		});
};
var _ezacharias$sftm$Render$reallyRaiseShape = F2(
	function (y, s) {
		return _elm_lang$core$Native_Utils.update(
			s,
			{
				above: s.above + y,
				below: s.below - y,
				svg: function (t) {
					return s.svg(
						_elm_lang$core$Native_Utils.update(
							t,
							{y: t.y + y}));
				},
				focus: A2(_ezacharias$sftm$Render$translateRectY, y, s.focus),
				assoc: A2(_ezacharias$sftm$Render$translateRectY, y, s.assoc)
			});
	});
var _ezacharias$sftm$Render$raiseShape = _ezacharias$sftm$Render$reallyRaiseShape(_ezacharias$sftm$Render$raiseY);
var _ezacharias$sftm$Render$translateRectX = function (x) {
	return _elm_lang$core$Maybe$map(
		function (r) {
			return _elm_lang$core$Native_Utils.update(
				r,
				{x: r.x + x});
		});
};
var _ezacharias$sftm$Render$maybes = F2(
	function (m1, m2) {
		var _p7 = m1;
		if (_p7.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(_p7._0);
		} else {
			return m2;
		}
	});
var _ezacharias$sftm$Render$contextParenColor = function (c) {
	var _p8 = {ctor: '_Tuple2', _0: c.focusPosition, _1: c.assocPosition};
	if (_p8._0.ctor === 'Inside') {
		return _ezacharias$sftm$Render$focusColor;
	} else {
		if (_p8._1.ctor === 'Inside') {
			return _ezacharias$sftm$Render$assocColor;
		} else {
			return _ezacharias$sftm$Render$nonFocusColor;
		}
	}
};
var _ezacharias$sftm$Render$contextColor = function (c) {
	var _p9 = {ctor: '_Tuple2', _0: c.focusPosition, _1: c.assocPosition};
	_v7_4:
	do {
		_v7_3:
		do {
			_v7_2:
			do {
				_v7_0:
				do {
					switch (_p9._0.ctor) {
						case 'Path':
							switch (_p9._1.ctor) {
								case 'Path':
									if (_p9._0._0.ctor === '[]') {
										break _v7_0;
									} else {
										if (_p9._1._0.ctor === '[]') {
											break _v7_2;
										} else {
											break _v7_4;
										}
									}
								case 'Inside':
									if (_p9._0._0.ctor === '[]') {
										break _v7_0;
									} else {
										break _v7_3;
									}
								default:
									if (_p9._0._0.ctor === '[]') {
										break _v7_0;
									} else {
										break _v7_4;
									}
							}
						case 'Inside':
							return _ezacharias$sftm$Render$focusColor;
						default:
							switch (_p9._1.ctor) {
								case 'Path':
									if (_p9._1._0.ctor === '[]') {
										break _v7_2;
									} else {
										break _v7_4;
									}
								case 'Inside':
									break _v7_3;
								default:
									break _v7_4;
							}
					}
				} while(false);
				return _ezacharias$sftm$Render$focusColor;
			} while(false);
			return _ezacharias$sftm$Render$assocColor;
		} while(false);
		return _ezacharias$sftm$Render$assocColor;
	} while(false);
	return _ezacharias$sftm$Render$nonFocusColor;
};
var _ezacharias$sftm$Render$rToStr = F2(
	function (m, n) {
		var d = (_elm_lang$core$Native_Utils.cmp(n, 0) < 0) ? '-' : '';
		var i = _elm_lang$core$Basics$round(
			_elm_lang$core$Basics$abs(n) * (1000 / m));
		var r = A2(_elm_lang$core$Basics_ops['%'], i, 1000);
		var e = _elm_lang$core$Native_Utils.eq(r, 0) ? '' : ((_elm_lang$core$Native_Utils.cmp(r, 10) < 0) ? A2(
			_elm_lang$core$Basics_ops['++'],
			'.00',
			_elm_lang$core$Basics$toString(r)) : ((_elm_lang$core$Native_Utils.cmp(r, 100) < 0) ? A2(
			_elm_lang$core$Basics_ops['++'],
			'.0',
			_elm_lang$core$Basics$toString(r)) : A2(
			_elm_lang$core$Basics_ops['++'],
			'.',
			_elm_lang$core$Basics$toString(r))));
		return A2(
			_elm_lang$core$Basics_ops['++'],
			d,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString((i / 1000) | 0),
				e));
	});
var _ezacharias$sftm$Render$toStr2 = _ezacharias$sftm$Render$rToStr(950);
var _ezacharias$sftm$Render$toStr = _ezacharias$sftm$Render$rToStr(850);
var _ezacharias$sftm$Render$toS = function (_p10) {
	return _elm_lang$core$Basics$toString(
		_elm_lang$core$Basics$round(_p10));
};
var _ezacharias$sftm$Render$shapeHtml = function (shape) {
	return _ezacharias$sftm$Utilities$castHtml(
		A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$style(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'transform: scale(1,-1);',
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_elm_lang$core$Basics_ops['++'],
								'width: ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_ezacharias$sftm$Render$toStr(shape.width),
									A2(_elm_lang$core$Basics_ops['++'], 'em', ';'))),
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$Basics_ops['++'],
									'height: ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_ezacharias$sftm$Render$toStr(shape.below + shape.above),
										A2(_elm_lang$core$Basics_ops['++'], 'em', ';'))),
								'flex-shrink: 1;')))),
				_1: {
					ctor: '::',
					_0: _ezacharias$sftm$Utilities$ariaHidden(true),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fill('none'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$viewBox(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_ezacharias$sftm$Render$toS(0.0),
									A2(
										_elm_lang$core$Basics_ops['++'],
										' ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_ezacharias$sftm$Render$toS(0.0 - shape.below),
											A2(
												_elm_lang$core$Basics_ops['++'],
												' ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_ezacharias$sftm$Render$toS(shape.width),
													A2(
														_elm_lang$core$Basics_ops['++'],
														' ',
														_ezacharias$sftm$Render$toS(shape.below + shape.above)))))))),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			shape.svg(
				{x: 0.0, y: 0.0})));
};
var _ezacharias$sftm$Render$formulaShapeView = function (shape) {
	var buffer = 500;
	var rect = _ezacharias$sftm$Render$shapeRect(shape);
	var centeredHeight = A2(_elm_lang$core$Basics$max, rect.above - _ezacharias$sftm$Render$midline, rect.below + _ezacharias$sftm$Render$midline) * 2;
	var halfHeight = A2(
		_elm_lang$core$Basics$max,
		925,
		A2(_elm_lang$core$Basics$max, rect.above - _ezacharias$sftm$Render$midline, rect.below + _ezacharias$sftm$Render$midline));
	var svg = _ezacharias$sftm$Utilities$castHtml(
		A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('center-formula'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fill('none'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox(
							A2(
								_elm_lang$core$Basics_ops['++'],
								_ezacharias$sftm$Render$toS(rect.x - buffer),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_ezacharias$sftm$Render$toS((rect.y - halfHeight) + _ezacharias$sftm$Render$midline),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_ezacharias$sftm$Render$toS(rect.width + (2 * buffer)),
												A2(
													_elm_lang$core$Basics_ops['++'],
													' ',
													_ezacharias$sftm$Render$toS(2 * halfHeight)))))))),
						_1: {ctor: '[]'}
					}
				}
			},
			shape.svg(
				{x: 0.0, y: 0.0})));
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('formula-svg-box'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: svg,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'height', _1: '1px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '1px'},
											_1: {ctor: '[]'}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _ezacharias$sftm$Utilities$castHtml(
							A2(
								_ezacharias$sftm$MathML$math,
								{ctor: '[]'},
								shape.mathML)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$shapeHeight = function (s) {
	return s.below + s.above;
};
var _ezacharias$sftm$Render$max3 = F3(
	function (f1, f2, f3) {
		return A2(
			_elm_lang$core$Basics$max,
			f1,
			A2(_elm_lang$core$Basics$max, f2, f3));
	});
var _ezacharias$sftm$Render$longLeftRightArrowShape = _ezacharias$sftm$Render$raiseShape(
	{
		width: 1859.0,
		above: 511.0,
		below: 11.0,
		svg: function (tr) {
			return {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
										_elm_lang$core$Basics$toString(40)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d(
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													'M',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toS(tr.x + 75),
														A2(
															_elm_lang$core$Basics_ops['++'],
															' ',
															_ezacharias$sftm$Render$toS(tr.y + 250)))),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'L',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 1783),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 250)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'M',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 285),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 40)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															A2(
																_elm_lang$core$Basics_ops['++'],
																'L',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_ezacharias$sftm$Render$toS(tr.x + 75),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' ',
																		_ezacharias$sftm$Render$toS(tr.y + 250)))),
															A2(
																_elm_lang$core$Basics_ops['++'],
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'L',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_ezacharias$sftm$Render$toS(tr.x + 285),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' ',
																			_ezacharias$sftm$Render$toS(tr.y + 460)))),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		'M',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_ezacharias$sftm$Render$toS(tr.x + 1573),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				' ',
																				_ezacharias$sftm$Render$toS(tr.y + 40)))),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'L',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_ezacharias$sftm$Render$toS(tr.x + 1783),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					' ',
																					_ezacharias$sftm$Render$toS(tr.y + 250)))),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'L',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_ezacharias$sftm$Render$toS(tr.x + 1573),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					' ',
																					_ezacharias$sftm$Render$toS(tr.y + 460)))))))))))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			};
		},
		focus: _elm_lang$core$Maybe$Nothing,
		assoc: _elm_lang$core$Maybe$Nothing,
		mathML: {
			ctor: '::',
			_0: A2(
				_ezacharias$sftm$MathML$mo,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('⟷'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _ezacharias$sftm$Render$leftRightArrowShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 987.0,
			above: 511.0,
			below: 11.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											_elm_lang$core$Basics$toString(40)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 75),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 250)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 911),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 250)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															A2(
																_elm_lang$core$Basics_ops['++'],
																'M',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_ezacharias$sftm$Render$toS(tr.x + 285),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' ',
																		_ezacharias$sftm$Render$toS(tr.y + 40)))),
															A2(
																_elm_lang$core$Basics_ops['++'],
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'L',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_ezacharias$sftm$Render$toS(tr.x + 75),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' ',
																			_ezacharias$sftm$Render$toS(tr.y + 250)))),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		'L',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_ezacharias$sftm$Render$toS(tr.x + 285),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				' ',
																				_ezacharias$sftm$Render$toS(tr.y + 460)))),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'M',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_ezacharias$sftm$Render$toS(tr.x + 701),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					' ',
																					_ezacharias$sftm$Render$toS(tr.y + 40)))),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				'L',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_ezacharias$sftm$Render$toS(tr.x + 911),
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						' ',
																						_ezacharias$sftm$Render$toS(tr.y + 250)))),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				'L',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_ezacharias$sftm$Render$toS(tr.x + 701),
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						' ',
																						_ezacharias$sftm$Render$toS(tr.y + 460)))))))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: A2(
				_ezacharias$sftm$Render$ifFocus,
				ctx,
				{
					ctor: '::',
					_0: A2(
						_ezacharias$sftm$MathML$mo,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('↔'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				})
		});
};
var _ezacharias$sftm$Render$turnstileShape = _ezacharias$sftm$Render$raiseShape(
	{
		width: 600.0,
		above: 550.0,
		below: 50.0,
		svg: function (tr) {
			return {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$stroke('White'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d(
										A2(
											_elm_lang$core$Basics_ops['++'],
											'M',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_ezacharias$sftm$Render$toS(tr.x + 70),
												A2(
													_elm_lang$core$Basics_ops['++'],
													' ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toS(tr.y - 30),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 70),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_ezacharias$sftm$Render$toS(tr.y + 530),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'M',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_ezacharias$sftm$Render$toS(tr.x + 70),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					' ',
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						_ezacharias$sftm$Render$toS(tr.y + 250),
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							'L',
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								_ezacharias$sftm$Render$toS(tr.x + 530),
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									' ',
																									_ezacharias$sftm$Render$toS(tr.y + 250))))))))))))))))),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			};
		},
		focus: _elm_lang$core$Maybe$Nothing,
		assoc: _elm_lang$core$Maybe$Nothing,
		mathML: {
			ctor: '::',
			_0: A2(
				_ezacharias$sftm$MathML$mo,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('⊢'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _ezacharias$sftm$Render$conjunctionShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 660.0,
			above: 550.0,
			below: 50.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											_elm_lang$core$Basics$toString(40)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 20),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y - 30)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 330),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 530)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 640),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y - 30))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: A2(
				_ezacharias$sftm$Render$ifFocus,
				ctx,
				{
					ctor: '::',
					_0: A2(
						_ezacharias$sftm$MathML$mo,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('∧'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				})
		});
};
var _ezacharias$sftm$Render$disjunctionShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 660.0,
			above: 550.0,
			below: 50.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											_elm_lang$core$Basics$toString(40)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 20),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 530)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 330),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y - 30)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 640),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 530))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: A2(
				_ezacharias$sftm$Render$ifFocus,
				ctx,
				{
					ctor: '::',
					_0: A2(
						_ezacharias$sftm$MathML$mo,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('∨'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				})
		});
};
var _ezacharias$sftm$Render$rightArrowShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 1159.0,
			above: 511.0,
			below: 11.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 75),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 250)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 1083),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 250)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															A2(
																_elm_lang$core$Basics_ops['++'],
																'M',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_ezacharias$sftm$Render$toS(tr.x + 873),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' ',
																		_ezacharias$sftm$Render$toS(tr.y + 40)))),
															A2(
																_elm_lang$core$Basics_ops['++'],
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'L',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_ezacharias$sftm$Render$toS(tr.x + 1083),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' ',
																			_ezacharias$sftm$Render$toS(tr.y + 250)))),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'L',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_ezacharias$sftm$Render$toS(tr.x + 873),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' ',
																			_ezacharias$sftm$Render$toS(tr.y + 460))))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: A2(
				_ezacharias$sftm$Render$ifFocus,
				ctx,
				{
					ctor: '::',
					_0: A2(
						_ezacharias$sftm$MathML$mo,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('→'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				})
		});
};
var _ezacharias$sftm$Render$upTackShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 790.0,
			above: 600.0,
			below: 90.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
										_elm_lang$core$Basics$toString(40)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d(
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													'M',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toS(tr.x + 60),
														A2(
															_elm_lang$core$Basics_ops['++'],
															' ',
															_ezacharias$sftm$Render$toS(tr.y - 70)))),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'L',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 720),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y - 70)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'M',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 390),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y - 60)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 390),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 580)))))))),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {
				ctor: '::',
				_0: A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('⊥'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$downTackShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 790.0,
			above: 590.0,
			below: 100.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_ezacharias$sftm$Render$toS(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d(
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													'M',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toS(tr.x + 60),
														A2(
															_elm_lang$core$Basics_ops['++'],
															' ',
															_ezacharias$sftm$Render$toS(tr.y + 570)))),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'L',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 720),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 570)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'M',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 390),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y - 80)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 390),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 560)))))))),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {
				ctor: '::',
				_0: A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('⊤'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$reallyGlyphShape = F5(
	function (xOffset, yOffset, color, m, glyph) {
		return {
			width: glyph.width,
			above: glyph.ascent,
			below: glyph.descent,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$use,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$xlinkHref(glyph.id),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$x(
									_ezacharias$sftm$Render$toS(tr.x + xOffset)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$y(
										_ezacharias$sftm$Render$toS(tr.y + yOffset)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(color),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {
				ctor: '::',
				_0: m,
				_1: {ctor: '[]'}
			}
		};
	});
var _ezacharias$sftm$Render$glyphShape = A2(_ezacharias$sftm$Render$reallyGlyphShape, 0, 0);
var _ezacharias$sftm$Render$notShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 775,
			above: 370.0,
			below: -130.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 75),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS(tr.y + 250)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 700),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 250)))),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'L',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_ezacharias$sftm$Render$toS(tr.x + 700),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' ',
																	_ezacharias$sftm$Render$toS(tr.y + 50))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {
				ctor: '::',
				_0: A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('¬'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$reallyBinaryShape = F3(
	function (s1, gly, s2) {
		return {
			width: (((s1.width + 400) + gly.width) + 400) + s2.width,
			above: A3(_ezacharias$sftm$Render$max3, s1.above, gly.above, s2.above),
			below: A3(_ezacharias$sftm$Render$max3, s1.below, gly.below, s2.below),
			svg: function (tr) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					s1.svg(tr),
					A2(
						_elm_lang$core$Basics_ops['++'],
						gly.svg(
							_elm_lang$core$Native_Utils.update(
								tr,
								{x: (tr.x + s1.width) + 400})),
						s2.svg(
							_elm_lang$core$Native_Utils.update(
								tr,
								{x: (((tr.x + s1.width) + 400) + gly.width) + 400}))));
			},
			focus: A2(
				_ezacharias$sftm$Render$maybes,
				s1.focus,
				A2(_ezacharias$sftm$Render$translateRectX, ((s1.width + 400) + gly.width) + 400, s2.focus)),
			assoc: A2(
				_ezacharias$sftm$Render$maybes,
				s1.assoc,
				A2(_ezacharias$sftm$Render$translateRectX, ((s1.width + 400) + gly.width) + 400, s2.assoc)),
			mathML: A2(
				_elm_lang$core$Basics_ops['++'],
				s1.mathML,
				A2(_elm_lang$core$Basics_ops['++'], gly.mathML, s2.mathML))
		};
	});
var _ezacharias$sftm$Render$reallyUnaryShape = F2(
	function (gly, s) {
		return {
			width: (gly.width + 100) + s.width,
			above: A2(_elm_lang$core$Basics$max, gly.above, s.above),
			below: A2(_elm_lang$core$Basics$max, gly.below, s.below),
			svg: function (tr) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					gly.svg(
						_elm_lang$core$Native_Utils.update(
							tr,
							{x: tr.x})),
					s.svg(
						_elm_lang$core$Native_Utils.update(
							tr,
							{x: (tr.x + gly.width) + 100})));
			},
			focus: A2(_ezacharias$sftm$Render$translateRectX, (gly.width + 100) + s.width, s.focus),
			assoc: A2(_ezacharias$sftm$Render$translateRectX, (gly.width + 100) + s.width, s.assoc),
			mathML: A2(_elm_lang$core$Basics_ops['++'], gly.mathML, s.mathML)
		};
	});
var _ezacharias$sftm$Render$rightParenShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 400,
			above: 250.0 + 750.0,
			below: -250 + 750.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextParenColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 70),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS((tr.y + 270) - 750.0)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														'A',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(1500 - 250),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_ezacharias$sftm$Render$toS(1500 - 250),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' ',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_ezacharias$sftm$Render$toS(0),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				' ',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_ezacharias$sftm$Render$toS(0),
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						' ',
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							_ezacharias$sftm$Render$toS(1),
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								' ',
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									_ezacharias$sftm$Render$toS(tr.x + 70),
																									A2(
																										_elm_lang$core$Basics_ops['++'],
																										' ',
																										_ezacharias$sftm$Render$toS((tr.y + 230) + 750)))))))))))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Render$leftParenShape = function (ctx) {
	return _ezacharias$sftm$Render$raiseShape(
		{
			width: 400,
			above: 250.0 + 750.0,
			below: -250 + 750.0,
			svg: function (tr) {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(
								_ezacharias$sftm$Render$contextParenColor(ctx)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(40)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d(
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'M',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(tr.x + 330),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																_ezacharias$sftm$Render$toS((tr.y + 270) - 750)))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														'A',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_ezacharias$sftm$Render$toS(1500 - 250),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_ezacharias$sftm$Render$toS(1500 - 250),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' ',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_ezacharias$sftm$Render$toS(0),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				' ',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_ezacharias$sftm$Render$toS(0),
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						' ',
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							_ezacharias$sftm$Render$toS(0),
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								' ',
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									_ezacharias$sftm$Render$toS(tr.x + 330),
																									A2(
																										_elm_lang$core$Basics_ops['++'],
																										' ',
																										_ezacharias$sftm$Render$toS((tr.y + 230) + 750)))))))))))))))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			},
			focus: _elm_lang$core$Maybe$Nothing,
			assoc: _elm_lang$core$Maybe$Nothing,
			mathML: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Render$commaSep = function (shapes) {
	var _p11 = shapes;
	if (_p11.ctor === '[]') {
		return _elm_lang$core$Native_Utils.crashCase(
			'Render',
			{
				start: {line: 202, column: 5},
				end: {line: 227, column: 18}
			},
			_p11)('impossible');
	} else {
		if (_p11._1.ctor === '[]') {
			return _p11._0;
		} else {
			var _p13 = _p11._0;
			var s_ = _ezacharias$sftm$Render$commaSep(_p11._1);
			var svg = function (tr) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p13.svg(tr),
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$use,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref(_ezacharias$sftm$Render$commaGlyph.id),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$x(
											_ezacharias$sftm$Render$toS(tr.x + _p13.width)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$y(
												_ezacharias$sftm$Render$toS(tr.y)),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('White'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						},
						s_.svg(
							_elm_lang$core$Native_Utils.update(
								tr,
								{x: ((tr.x + _p13.width) + _ezacharias$sftm$Render$commaGlyph.width) + 400, y: tr.y}))));
			};
			return {
				width: ((_p13.width + _ezacharias$sftm$Render$commaGlyph.width) + 400) + s_.width,
				above: A3(_ezacharias$sftm$Render$max3, _p13.above, _ezacharias$sftm$Render$commaGlyph.ascent, s_.above),
				below: A3(_ezacharias$sftm$Render$max3, _p13.below, _ezacharias$sftm$Render$commaGlyph.descent, s_.below),
				svg: svg,
				focus: _elm_lang$core$Maybe$Nothing,
				assoc: _elm_lang$core$Maybe$Nothing,
				mathML: _elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$intersperse,
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$MathML$mo,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(','),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						A2(
							_elm_lang$core$List$map,
							function (_) {
								return _.mathML;
							},
							shapes)))
			};
		}
	}
};
var _ezacharias$sftm$Render$emptyShape = {
	width: 0.0,
	above: 0.0,
	below: 0.0,
	svg: function (tr) {
		return {ctor: '[]'};
	},
	focus: _elm_lang$core$Maybe$Nothing,
	assoc: _elm_lang$core$Maybe$Nothing,
	mathML: {ctor: '[]'}
};
var _ezacharias$sftm$Render$space = {
	width: 600.0,
	above: 0.0,
	below: 0.0,
	svg: function (tr) {
		return {ctor: '[]'};
	},
	focus: _elm_lang$core$Maybe$Nothing,
	assoc: _elm_lang$core$Maybe$Nothing,
	mathML: {ctor: '[]'}
};
var _ezacharias$sftm$Render$horizontal = F2(
	function (s1, s2) {
		return {
			width: s1.width + s2.width,
			above: A2(_elm_lang$core$Basics$max, s1.above, s2.above),
			below: A2(_elm_lang$core$Basics$max, s1.below, s2.below),
			svg: function (tr) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					s1.svg(tr),
					s2.svg(
						{x: tr.x + s1.width, y: tr.y}));
			},
			focus: A2(
				_ezacharias$sftm$Render$maybes,
				s1.focus,
				A2(_ezacharias$sftm$Render$translateRectX, s1.width, s2.focus)),
			assoc: A2(
				_ezacharias$sftm$Render$maybes,
				s1.assoc,
				A2(_ezacharias$sftm$Render$translateRectX, s1.width, s2.assoc)),
			mathML: A2(_elm_lang$core$Basics_ops['++'], s1.mathML, s2.mathML)
		};
	});
var _ezacharias$sftm$Render$expansion = 50;
var _ezacharias$sftm$Render$shapeSpan = function (shape) {
	return _ezacharias$sftm$Utilities$castHtml(
		A2(
			_elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'position', _1: 'relative'},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'width',
									_1: A2(
										_elm_lang$core$Basics_ops['++'],
										_ezacharias$sftm$Render$toStr2(shape.width),
										'em')
								},
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$svg,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$style(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'transform: scale(1,-1);',
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_elm_lang$core$Basics_ops['++'],
										'width: ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_ezacharias$sftm$Render$toStr2(shape.width + (_ezacharias$sftm$Render$expansion * 2)),
											A2(_elm_lang$core$Basics_ops['++'], 'em', ';'))),
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$Basics_ops['++'],
											'height: ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_ezacharias$sftm$Render$toStr2((shape.below + shape.above) + (_ezacharias$sftm$Render$expansion * 2)),
												A2(_elm_lang$core$Basics_ops['++'], 'em', ';'))),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'position: absolute;',
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													'bottom: ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toStr2(0.0 - (shape.below + _ezacharias$sftm$Render$expansion)),
														'em;')),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'left: ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toStr2(0.0 - _ezacharias$sftm$Render$expansion),
														'em;')))))))),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Utilities$ariaHidden(true),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('none'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$viewBox(
										A2(
											_elm_lang$core$Basics_ops['++'],
											A2(
												_elm_lang$core$Basics_ops['++'],
												_ezacharias$sftm$Render$toS(0.0),
												' '),
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													_ezacharias$sftm$Render$toS(0.0 - (shape.below + _ezacharias$sftm$Render$expansion)),
													' '),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														_ezacharias$sftm$Render$toS(shape.width + (_ezacharias$sftm$Render$expansion * 2)),
														' '),
													_ezacharias$sftm$Render$toS((shape.below + shape.above) + (_ezacharias$sftm$Render$expansion * 2)))))),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					shape.svg(
						{x: _ezacharias$sftm$Render$expansion, y: 0.0})),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'height', _1: '1px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '1px'},
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$MathML$math,
								{ctor: '[]'},
								shape.mathML),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}));
};
var _ezacharias$sftm$Render$frakturAHtml = _ezacharias$sftm$Render$shapeSpan(
	A3(
		_ezacharias$sftm$Render$glyphShape,
		_ezacharias$sftm$Render$metaColor,
		A2(
			_ezacharias$sftm$MathML$mi,
			{
				ctor: '::',
				_0: _ezacharias$sftm$MathML_Attributes$mathvariant('fraktur'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('A'),
				_1: {ctor: '[]'}
			}),
		_ezacharias$sftm$Render$frakturAGlyph));
var _ezacharias$sftm$Render$latinUpperAHtml = _ezacharias$sftm$Render$shapeSpan(
	A5(
		_ezacharias$sftm$Render$reallyGlyphShape,
		-40,
		0,
		_ezacharias$sftm$Render$focusColor,
		A2(
			_ezacharias$sftm$MathML$mi,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('A'),
				_1: {ctor: '[]'}
			}),
		_ezacharias$sftm$Render$latinUpperAGlyph));
var _ezacharias$sftm$Render$latinUpperBHtml = _ezacharias$sftm$Render$shapeSpan(
	A5(
		_ezacharias$sftm$Render$reallyGlyphShape,
		-70,
		0,
		_ezacharias$sftm$Render$focusColor,
		A2(
			_ezacharias$sftm$MathML$mi,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('B'),
				_1: {ctor: '[]'}
			}),
		_ezacharias$sftm$Render$latinUpperBGlyph));
var _ezacharias$sftm$Render$latinUpperCHtml = _ezacharias$sftm$Render$shapeSpan(
	A5(
		_ezacharias$sftm$Render$reallyGlyphShape,
		-40,
		0,
		_ezacharias$sftm$Render$focusColor,
		A2(
			_ezacharias$sftm$MathML$mi,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('C'),
				_1: {ctor: '[]'}
			}),
		_ezacharias$sftm$Render$latinUpperCGlyph));
var _ezacharias$sftm$Render$longLeftRightArrowHtml = _ezacharias$sftm$Render$shapeSpan(_ezacharias$sftm$Render$longLeftRightArrowShape);
var _ezacharias$sftm$Render$turnstileHtml = _ezacharias$sftm$Render$shapeSpan(_ezacharias$sftm$Render$turnstileShape);
var _ezacharias$sftm$Render$expandShape = function (shape) {
	return _elm_lang$core$Native_Utils.update(
		shape,
		{
			width: shape.width + (_ezacharias$sftm$Render$expansion * 2),
			below: shape.below + _ezacharias$sftm$Render$expansion,
			above: shape.above + _ezacharias$sftm$Render$expansion,
			svg: function (tr) {
				return shape.svg(
					_elm_lang$core$Native_Utils.update(
						tr,
						{x: tr.x + _ezacharias$sftm$Render$expansion}));
			}
		});
};
var _ezacharias$sftm$Render$centerDiv = function (shape) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('center-svg-box'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _ezacharias$sftm$Render$shapeHtml(shape),
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Utilities$castHtml(
					A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'height', _1: '1px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '1px'},
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$MathML$math,
								{ctor: '[]'},
								shape.mathML),
							_1: {ctor: '[]'}
						})),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$starDiv = _ezacharias$sftm$Render$centerDiv(
	A3(
		_ezacharias$sftm$Render$glyphShape,
		_ezacharias$sftm$Render$metaColor,
		A2(
			_ezacharias$sftm$MathML$mo,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('⋆'),
				_1: {ctor: '[]'}
			}),
		_ezacharias$sftm$Render$starGlyph));
var _ezacharias$sftm$Render$leftDiv = function (shape) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('left-svg-box'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _ezacharias$sftm$Render$shapeHtml(shape),
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Utilities$castHtml(
					A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'height', _1: '1px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '1px'},
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$MathML$math,
								{ctor: '[]'},
								shape.mathML),
							_1: {ctor: '[]'}
						})),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Render$Shape = F7(
	function (a, b, c, d, e, f, g) {
		return {width: a, above: b, below: c, svg: d, focus: e, assoc: f, mathML: g};
	});
var _ezacharias$sftm$Render$Rect = F5(
	function (a, b, c, d, e) {
		return {x: a, y: b, width: c, above: d, below: e};
	});
var _ezacharias$sftm$Render$Glyph = F6(
	function (a, b, c, d, e, f) {
		return {id: a, ascent: b, descent: c, width: d, xStart: e, xEnd: f};
	});
var _ezacharias$sftm$Render$Transform = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _ezacharias$sftm$Render$Context = F3(
	function (a, b, c) {
		return {precedence: a, focusPosition: b, assocPosition: c};
	});
var _ezacharias$sftm$Render$Outside = {ctor: 'Outside'};
var _ezacharias$sftm$Render$Inside = {ctor: 'Inside'};
var _ezacharias$sftm$Render$defaultContext = {precedence: 0, focusPosition: _ezacharias$sftm$Render$Inside, assocPosition: _ezacharias$sftm$Render$Outside};
var _ezacharias$sftm$Render$symbolShape = function (symbol) {
	var _p14 = symbol;
	switch (_p14.ctor) {
		case 'Top':
			return _ezacharias$sftm$Render$downTackShape(_ezacharias$sftm$Render$defaultContext);
		case 'Bot':
			return _ezacharias$sftm$Render$upTackShape(_ezacharias$sftm$Render$defaultContext);
		case 'VarA':
			return A5(
				_ezacharias$sftm$Render$reallyGlyphShape,
				-40,
				0,
				_ezacharias$sftm$Render$focusColor,
				A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('A'),
						_1: {ctor: '[]'}
					}),
				_ezacharias$sftm$Render$latinUpperAGlyph);
		case 'VarB':
			return A5(
				_ezacharias$sftm$Render$reallyGlyphShape,
				-40,
				0,
				_ezacharias$sftm$Render$focusColor,
				A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('B'),
						_1: {ctor: '[]'}
					}),
				_ezacharias$sftm$Render$latinUpperBGlyph);
		case 'VarC':
			return A5(
				_ezacharias$sftm$Render$reallyGlyphShape,
				-40,
				0,
				_ezacharias$sftm$Render$focusColor,
				A2(
					_ezacharias$sftm$MathML$mi,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('C'),
						_1: {ctor: '[]'}
					}),
				_ezacharias$sftm$Render$latinUpperCGlyph);
		case 'Negation':
			return _ezacharias$sftm$Render$notShape(_ezacharias$sftm$Render$defaultContext);
		case 'Conjunction':
			return _ezacharias$sftm$Render$conjunctionShape(_ezacharias$sftm$Render$defaultContext);
		case 'Disjunction':
			return _ezacharias$sftm$Render$disjunctionShape(_ezacharias$sftm$Render$defaultContext);
		case 'Equivalence':
			return _ezacharias$sftm$Render$leftRightArrowShape(_ezacharias$sftm$Render$defaultContext);
		default:
			return _ezacharias$sftm$Render$rightArrowShape(_ezacharias$sftm$Render$defaultContext);
	}
};
var _ezacharias$sftm$Render$symbolSvg = _elm_lang$html$Html_Lazy$lazy(
	function (_p15) {
		return _ezacharias$sftm$Render$leftDiv(
			_ezacharias$sftm$Render$symbolShape(_p15));
	});
var _ezacharias$sftm$Render$topHtml = _ezacharias$sftm$Render$shapeSpan(
	_ezacharias$sftm$Render$downTackShape(_ezacharias$sftm$Render$defaultContext));
var _ezacharias$sftm$Render$botHtml = _ezacharias$sftm$Render$shapeSpan(
	_ezacharias$sftm$Render$upTackShape(_ezacharias$sftm$Render$defaultContext));
var _ezacharias$sftm$Render$equivalenceHtml = _ezacharias$sftm$Render$shapeSpan(
	_ezacharias$sftm$Render$leftRightArrowShape(_ezacharias$sftm$Render$defaultContext));
var _ezacharias$sftm$Render$conjunctionHtml = _ezacharias$sftm$Render$shapeSpan(
	_ezacharias$sftm$Render$conjunctionShape(_ezacharias$sftm$Render$defaultContext));
var _ezacharias$sftm$Render$disjunctionHtml = _ezacharias$sftm$Render$shapeSpan(
	_ezacharias$sftm$Render$disjunctionShape(_ezacharias$sftm$Render$defaultContext));
var _ezacharias$sftm$Render$ifInnerFocus = F2(
	function (ctx, m) {
		return _elm_lang$core$Native_Utils.eq(ctx.focusPosition, _ezacharias$sftm$Render$Inside) ? m : {ctor: '[]'};
	});
var _ezacharias$sftm$Render$parens = F2(
	function (ctx, shape) {
		return {
			width: (400 + shape.width) + 400,
			above: 250 + 750,
			below: -250 + 750,
			svg: function (tr) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_ezacharias$sftm$Render$leftParenShape(ctx).svg(tr),
					A2(
						_elm_lang$core$Basics_ops['++'],
						shape.svg(
							_elm_lang$core$Native_Utils.update(
								tr,
								{x: tr.x + 400})),
						_ezacharias$sftm$Render$rightParenShape(ctx).svg(
							_elm_lang$core$Native_Utils.update(
								tr,
								{x: (tr.x + 400) + shape.width}))));
			},
			focus: A2(_ezacharias$sftm$Render$translateRectX, 400, shape.focus),
			assoc: A2(_ezacharias$sftm$Render$translateRectX, 400, shape.assoc),
			mathML: A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_ezacharias$sftm$Render$ifInnerFocus,
					ctx,
					{
						ctor: '::',
						_0: A2(
							_ezacharias$sftm$MathML$mo,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('('),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				A2(
					_elm_lang$core$Basics_ops['++'],
					shape.mathML,
					A2(
						_ezacharias$sftm$Render$ifInnerFocus,
						ctx,
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$MathML$mo,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(')'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						})))
		};
	});
var _ezacharias$sftm$Render$Path = function (a) {
	return {ctor: 'Path', _0: a};
};
var _ezacharias$sftm$Render$contextInLeft = F2(
	function (i, c) {
		var assocPosition = function () {
			var _p16 = c.assocPosition;
			switch (_p16.ctor) {
				case 'Path':
					if (_p16._0.ctor === '[]') {
						return _ezacharias$sftm$Render$Inside;
					} else {
						if (_p16._0._0.ctor === 'GoLeft') {
							return _ezacharias$sftm$Render$Path(_p16._0._1);
						} else {
							return _ezacharias$sftm$Render$Outside;
						}
					}
				case 'Inside':
					return _ezacharias$sftm$Render$Inside;
				default:
					return _ezacharias$sftm$Render$Outside;
			}
		}();
		var focusPosition = function () {
			var _p17 = c.focusPosition;
			switch (_p17.ctor) {
				case 'Path':
					if (_p17._0.ctor === '[]') {
						return _ezacharias$sftm$Render$Inside;
					} else {
						if (_p17._0._0.ctor === 'GoLeft') {
							return _ezacharias$sftm$Render$Path(_p17._0._1);
						} else {
							return _ezacharias$sftm$Render$Outside;
						}
					}
				case 'Inside':
					return _ezacharias$sftm$Render$Inside;
				default:
					return _ezacharias$sftm$Render$Outside;
			}
		}();
		return _elm_lang$core$Native_Utils.update(
			c,
			{precedence: i, focusPosition: focusPosition, assocPosition: assocPosition});
	});
var _ezacharias$sftm$Render$contextInRight = F2(
	function (i, c) {
		var assocPosition = function () {
			var _p18 = c.assocPosition;
			switch (_p18.ctor) {
				case 'Path':
					if (_p18._0.ctor === '[]') {
						return _ezacharias$sftm$Render$Inside;
					} else {
						if (_p18._0._0.ctor === 'GoLeft') {
							return _ezacharias$sftm$Render$Outside;
						} else {
							return _ezacharias$sftm$Render$Path(_p18._0._1);
						}
					}
				case 'Inside':
					return _ezacharias$sftm$Render$Inside;
				default:
					return _ezacharias$sftm$Render$Outside;
			}
		}();
		var focusPosition = function () {
			var _p19 = c.focusPosition;
			switch (_p19.ctor) {
				case 'Path':
					if (_p19._0.ctor === '[]') {
						return _ezacharias$sftm$Render$Inside;
					} else {
						if (_p19._0._0.ctor === 'GoLeft') {
							return _ezacharias$sftm$Render$Outside;
						} else {
							return _ezacharias$sftm$Render$Path(_p19._0._1);
						}
					}
				case 'Inside':
					return _ezacharias$sftm$Render$Inside;
				default:
					return _ezacharias$sftm$Render$Outside;
			}
		}();
		return _elm_lang$core$Native_Utils.update(
			c,
			{precedence: i, focusPosition: focusPosition, assocPosition: assocPosition});
	});
var _ezacharias$sftm$Render$binaryShape = F5(
	function (ctx, i, t1, g, t2) {
		var s = A3(
			_ezacharias$sftm$Render$reallyBinaryShape,
			A2(
				_ezacharias$sftm$Render$reallyTermShape,
				A2(_ezacharias$sftm$Render$contextInLeft, i + 1, ctx),
				t1),
			g,
			A2(
				_ezacharias$sftm$Render$reallyTermShape,
				A2(_ezacharias$sftm$Render$contextInRight, i + 1, ctx),
				t2));
		return (_elm_lang$core$Native_Utils.cmp(0, ctx.precedence) < 0) ? A2(_ezacharias$sftm$Render$parens, ctx, s) : s;
	});
var _ezacharias$sftm$Render$reallyTermShape = F2(
	function (ctx, term) {
		var shape0 = A2(_ezacharias$sftm$Render$reallyTermShape2, ctx, term);
		var shape1 = _ezacharias$sftm$Render$contextIsTrueFocus(ctx) ? _elm_lang$core$Native_Utils.update(
			shape0,
			{
				focus: _elm_lang$core$Maybe$Just(
					{x: 0, y: 0, width: shape0.width, above: shape0.above, below: shape0.below})
			}) : shape0;
		var shape2 = _ezacharias$sftm$Render$contextIsTrueAssoc(ctx) ? _elm_lang$core$Native_Utils.update(
			shape1,
			{
				assoc: _elm_lang$core$Maybe$Just(
					{x: 0, y: 0, width: shape1.width, above: shape1.above, below: shape1.below})
			}) : shape1;
		var shape3 = _ezacharias$sftm$Render$contextIsMathML(ctx) ? shape2 : _elm_lang$core$Native_Utils.update(
			shape2,
			{
				mathML: {ctor: '[]'}
			});
		return shape3;
	});
var _ezacharias$sftm$Render$reallyTermShape2 = F2(
	function (ctx, term) {
		var _p20 = term;
		switch (_p20.ctor) {
			case 'Binary':
				switch (_p20._0.ctor) {
					case 'Equivalence':
						return A5(
							_ezacharias$sftm$Render$binaryShape,
							ctx,
							0,
							_p20._1,
							_ezacharias$sftm$Render$leftRightArrowShape(ctx),
							_p20._2);
					case 'Implication':
						return A5(
							_ezacharias$sftm$Render$binaryShape,
							ctx,
							1,
							_p20._1,
							_ezacharias$sftm$Render$rightArrowShape(ctx),
							_p20._2);
					case 'Disjunction':
						return A5(
							_ezacharias$sftm$Render$binaryShape,
							ctx,
							2,
							_p20._1,
							_ezacharias$sftm$Render$disjunctionShape(ctx),
							_p20._2);
					default:
						return A5(
							_ezacharias$sftm$Render$binaryShape,
							ctx,
							3,
							_p20._1,
							_ezacharias$sftm$Render$conjunctionShape(ctx),
							_p20._2);
				}
			case 'Unary':
				return A4(
					_ezacharias$sftm$Render$unaryShape,
					ctx,
					10,
					_ezacharias$sftm$Render$notShape(ctx),
					_p20._1);
			default:
				switch (_p20._0.ctor) {
					case 'Top':
						return _ezacharias$sftm$Render$downTackShape(ctx);
					case 'Bot':
						return _ezacharias$sftm$Render$upTackShape(ctx);
					case 'VarA':
						return A5(
							_ezacharias$sftm$Render$reallyGlyphShape,
							-40,
							0,
							_ezacharias$sftm$Render$contextColor(ctx),
							A2(
								_ezacharias$sftm$MathML$mi,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('A'),
									_1: {ctor: '[]'}
								}),
							_ezacharias$sftm$Render$latinUpperAGlyph);
					case 'VarB':
						return A5(
							_ezacharias$sftm$Render$reallyGlyphShape,
							-40,
							0,
							_ezacharias$sftm$Render$contextColor(ctx),
							A2(
								_ezacharias$sftm$MathML$mi,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('B'),
									_1: {ctor: '[]'}
								}),
							_ezacharias$sftm$Render$latinUpperBGlyph);
					case 'VarC':
						return A5(
							_ezacharias$sftm$Render$reallyGlyphShape,
							-40,
							0,
							_ezacharias$sftm$Render$contextColor(ctx),
							A2(
								_ezacharias$sftm$MathML$mi,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('C'),
									_1: {ctor: '[]'}
								}),
							_ezacharias$sftm$Render$latinUpperCGlyph);
					default:
						switch (_p20._0._0.ctor) {
							case 'MetaA':
								return A3(
									_ezacharias$sftm$Render$glyphShape,
									_ezacharias$sftm$Render$metaColor,
									A2(
										_ezacharias$sftm$MathML$mi,
										{
											ctor: '::',
											_0: _ezacharias$sftm$MathML_Attributes$mathvariant('fraktur'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('A'),
											_1: {ctor: '[]'}
										}),
									_ezacharias$sftm$Render$frakturAGlyph);
							case 'MetaB':
								return A3(
									_ezacharias$sftm$Render$glyphShape,
									_ezacharias$sftm$Render$metaColor,
									A2(
										_ezacharias$sftm$MathML$mi,
										{
											ctor: '::',
											_0: _ezacharias$sftm$MathML_Attributes$mathvariant('fraktur'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('B'),
											_1: {ctor: '[]'}
										}),
									_ezacharias$sftm$Render$frakturBGlyph);
							default:
								return A3(
									_ezacharias$sftm$Render$glyphShape,
									_ezacharias$sftm$Render$metaColor,
									A2(
										_ezacharias$sftm$MathML$mi,
										{
											ctor: '::',
											_0: _ezacharias$sftm$MathML_Attributes$mathvariant('fraktur'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('C'),
											_1: {ctor: '[]'}
										}),
									_ezacharias$sftm$Render$frakturCGlyph);
						}
				}
		}
	});
var _ezacharias$sftm$Render$unaryShape = F4(
	function (ctx, i, g, t) {
		var s = A2(
			_ezacharias$sftm$Render$reallyUnaryShape,
			g,
			A2(
				_ezacharias$sftm$Render$reallyTermShape,
				A2(_ezacharias$sftm$Render$contextInRight, i + 1, ctx),
				t));
		return (_elm_lang$core$Native_Utils.cmp(0, ctx.precedence) < 0) ? A2(_ezacharias$sftm$Render$parens, ctx, s) : s;
	});
var _ezacharias$sftm$Render$ruleShape = function (rule) {
	var right = A2(
		_ezacharias$sftm$Render$reallyTermShape,
		{precedence: 0, focusPosition: _ezacharias$sftm$Render$Inside, assocPosition: _ezacharias$sftm$Render$Outside},
		rule.right);
	var left = A2(
		_ezacharias$sftm$Render$reallyTermShape,
		{precedence: 0, focusPosition: _ezacharias$sftm$Render$Inside, assocPosition: _ezacharias$sftm$Render$Outside},
		rule.left);
	var antecedents = _elm_lang$core$List$isEmpty(rule.antecedents) ? _ezacharias$sftm$Render$emptyShape : A2(
		_ezacharias$sftm$Render$horizontal,
		_ezacharias$sftm$Render$commaSep(
			A2(
				_elm_lang$core$List$map,
				_ezacharias$sftm$Render$reallyTermShape(
					{precedence: 0, focusPosition: _ezacharias$sftm$Render$Inside, assocPosition: _ezacharias$sftm$Render$Outside}),
				rule.antecedents)),
		_ezacharias$sftm$Render$space);
	return A3(
		_elm_lang$core$List$foldr,
		_ezacharias$sftm$Render$horizontal,
		_ezacharias$sftm$Render$emptyShape,
		{
			ctor: '::',
			_0: antecedents,
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Render$turnstileShape,
				_1: {
					ctor: '::',
					_0: _ezacharias$sftm$Render$space,
					_1: {
						ctor: '::',
						_0: left,
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Render$space,
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Render$longLeftRightArrowShape,
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Render$space,
									_1: {
										ctor: '::',
										_0: right,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _ezacharias$sftm$Render$midRuleShape = function (rule) {
	var shape = _ezacharias$sftm$Render$ruleShape(rule);
	return _elm_lang$core$Native_Utils.update(
		shape,
		{above: _ezacharias$sftm$Render$midline + 750, below: 750 - _ezacharias$sftm$Render$midline});
};
var _ezacharias$sftm$Render$leftRuleDiv = _elm_lang$html$Html_Lazy$lazy(
	function (_p21) {
		return _ezacharias$sftm$Render$leftDiv(
			_ezacharias$sftm$Render$expandShape(
				_ezacharias$sftm$Render$midRuleShape(_p21)));
	});
var _ezacharias$sftm$Render$ruleSpan = _elm_lang$html$Html_Lazy$lazy(
	function (_p22) {
		return _ezacharias$sftm$Render$shapeSpan(
			_ezacharias$sftm$Render$ruleShape(_p22));
	});
var _ezacharias$sftm$Render$termShape = _ezacharias$sftm$Render$reallyTermShape(
	{precedence: 0, focusPosition: _ezacharias$sftm$Render$Inside, assocPosition: _ezacharias$sftm$Render$Outside});
var _ezacharias$sftm$Render$midTermShape = function (term) {
	var shape = _ezacharias$sftm$Render$termShape(term);
	return _elm_lang$core$Native_Utils.update(
		shape,
		{above: _ezacharias$sftm$Render$midline + 750, below: 750 - _ezacharias$sftm$Render$midline});
};
var _ezacharias$sftm$Render$formulaView = function (_p23) {
	return _ezacharias$sftm$Render$formulaShapeView(
		_ezacharias$sftm$Render$midTermShape(_p23));
};
var _ezacharias$sftm$Render$leftTermDiv = _elm_lang$html$Html_Lazy$lazy(
	function (_p24) {
		return _ezacharias$sftm$Render$leftDiv(
			_ezacharias$sftm$Render$expandShape(
				_ezacharias$sftm$Render$midTermShape(_p24)));
	});
var _ezacharias$sftm$Render$centerTermDiv = _elm_lang$html$Html_Lazy$lazy(
	function (_p25) {
		return _ezacharias$sftm$Render$centerDiv(
			_ezacharias$sftm$Render$expandShape(
				_ezacharias$sftm$Render$midTermShape(_p25)));
	});
var _ezacharias$sftm$Render$termSpan = _elm_lang$html$Html_Lazy$lazy(
	function (_p26) {
		return _ezacharias$sftm$Render$shapeSpan(
			_ezacharias$sftm$Render$termShape(_p26));
	});
var _ezacharias$sftm$Render$yellowTermShape = function (term) {
	var shape = A2(
		_ezacharias$sftm$Render$reallyTermShape,
		{precedence: 0, focusPosition: _ezacharias$sftm$Render$Outside, assocPosition: _ezacharias$sftm$Render$Inside},
		term);
	return _elm_lang$core$Native_Utils.update(
		shape,
		{above: _ezacharias$sftm$Render$midline + 750, below: 750 - _ezacharias$sftm$Render$midline});
};
var _ezacharias$sftm$Render$yellowLeftTermDiv = _elm_lang$html$Html_Lazy$lazy(
	function (_p27) {
		return _ezacharias$sftm$Render$leftDiv(
			_ezacharias$sftm$Render$expandShape(
				_ezacharias$sftm$Render$yellowTermShape(_p27)));
	});
var _ezacharias$sftm$Render$reallyFormulaHtml1 = F2(
	function (term, path) {
		return _ezacharias$sftm$Render$formulaShapeView(
			A2(
				_ezacharias$sftm$Render$reallyTermShape,
				{
					precedence: 0,
					focusPosition: _ezacharias$sftm$Render$Path(path),
					assocPosition: _ezacharias$sftm$Render$Outside
				},
				term));
	});
var _ezacharias$sftm$Render$reallyFormulaHtml0 = function (term) {
	return A2(
		_ezacharias$sftm$Render$reallyFormulaHtml1,
		term,
		{ctor: '[]'});
};
var _ezacharias$sftm$Render$formulaHtml0 = _elm_lang$html$Html_Lazy$lazy(_ezacharias$sftm$Render$reallyFormulaHtml0);
var _ezacharias$sftm$Render$formulaHtml1 = _elm_lang$html$Html_Lazy$lazy2(_ezacharias$sftm$Render$reallyFormulaHtml1);
var _ezacharias$sftm$Render$reallyFormulaHtml2 = F3(
	function (term, path1, path2) {
		var _p28 = path2;
		if (_p28.ctor === '[]') {
			return _ezacharias$sftm$Render$formulaShapeView(
				A2(
					_ezacharias$sftm$Render$reallyTermShape,
					{
						precedence: 0,
						focusPosition: _ezacharias$sftm$Render$Path(path1),
						assocPosition: _ezacharias$sftm$Render$Outside
					},
					term));
		} else {
			return _ezacharias$sftm$Render$formulaShapeView(
				A2(
					_ezacharias$sftm$Render$reallyTermShape,
					{
						precedence: 0,
						focusPosition: _ezacharias$sftm$Render$Path(path1),
						assocPosition: _ezacharias$sftm$Render$Path(path2)
					},
					term));
		}
	});
var _ezacharias$sftm$Render$formulaHtml2 = _elm_lang$html$Html_Lazy$lazy3(_ezacharias$sftm$Render$reallyFormulaHtml2);

var _ezacharias$sftm$Dialog_Scratch$isValid = F3(
	function (left, symbol, right) {
		var binary = function () {
			var _p0 = {ctor: '_Tuple2', _0: left, _1: right};
			if (((_p0.ctor === '_Tuple2') && (_p0._0.ctor === 'Just')) && (_p0._1.ctor === 'Just')) {
				return true;
			} else {
				return false;
			}
		}();
		var prefix = function () {
			var _p1 = right;
			if (_p1.ctor === 'Nothing') {
				return false;
			} else {
				return true;
			}
		}();
		var _p2 = symbol;
		if (_p2.ctor === 'Nothing') {
			return true;
		} else {
			var _p3 = _p2._0;
			switch (_p3.ctor) {
				case 'Top':
					return true;
				case 'Bot':
					return true;
				case 'VarA':
					return true;
				case 'VarB':
					return true;
				case 'VarC':
					return true;
				case 'Negation':
					return prefix;
				case 'Conjunction':
					return binary;
				case 'Disjunction':
					return binary;
				case 'Equivalence':
					return binary;
				default:
					return binary;
			}
		}
	});
var _ezacharias$sftm$Dialog_Scratch$formula = F4(
	function (focus, left, symbol, right) {
		var binary = function (op) {
			return A3(
				_ezacharias$sftm$Term$Binary,
				op,
				A2(
					_elm_lang$core$Maybe$withDefault,
					_ezacharias$sftm$Term$Atom(
						_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
					left),
				A2(
					_elm_lang$core$Maybe$withDefault,
					_ezacharias$sftm$Term$Atom(
						_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
					right));
		};
		var prefix = function (op) {
			return A2(
				_ezacharias$sftm$Term$Unary,
				op,
				A2(
					_elm_lang$core$Maybe$withDefault,
					_ezacharias$sftm$Term$Atom(
						_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
					right));
		};
		var _p4 = symbol;
		if (_p4.ctor === 'Nothing') {
			return focus;
		} else {
			var _p5 = _p4._0;
			switch (_p5.ctor) {
				case 'Top':
					return _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top);
				case 'Bot':
					return _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot);
				case 'VarA':
					return _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA);
				case 'VarB':
					return _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB);
				case 'VarC':
					return _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC);
				case 'Negation':
					return prefix(_ezacharias$sftm$Term$Not);
				case 'Conjunction':
					return binary(_ezacharias$sftm$Term$Conjunction);
				case 'Disjunction':
					return binary(_ezacharias$sftm$Term$Disjunction);
				case 'Equivalence':
					return binary(_ezacharias$sftm$Term$Equivalence);
				default:
					return binary(_ezacharias$sftm$Term$Implication);
			}
		}
	});
var _ezacharias$sftm$Dialog_Scratch$isSelected = F2(
	function (selection, i1) {
		var _p6 = selection;
		if (_p6.ctor === 'Nothing') {
			return false;
		} else {
			return _elm_lang$core$Native_Utils.eq(i1, _p6._0);
		}
	});
var _ezacharias$sftm$Dialog_Scratch$toggle = F2(
	function (i, m) {
		return _elm_lang$core$Native_Utils.eq(
			m,
			_elm_lang$core$Maybe$Just(i)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(i);
	});
var _ezacharias$sftm$Dialog_Scratch$hiddenClass = function (b) {
	return b ? ' hidden' : '';
};
var _ezacharias$sftm$Dialog_Scratch$selectedClass = function (b) {
	return b ? ' selected' : '';
};
var _ezacharias$sftm$Dialog_Scratch$isHidden = function (model) {
	var _p7 = A2(
		_elm_lang$core$Maybe$map,
		function (i) {
			return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.symbols);
		},
		model.symbol);
	if (_p7.ctor === 'Nothing') {
		return true;
	} else {
		var _p8 = _p7._0;
		switch (_p8.ctor) {
			case 'Conjunction':
				return false;
			case 'Disjunction':
				return false;
			case 'Equivalence':
				return false;
			case 'Implication':
				return false;
			default:
				return true;
		}
	}
};
var _ezacharias$sftm$Dialog_Scratch$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {selection: a, left: b, symbol: c, right: d, symbols: e, scratch: f, focus: g};
	});
var _ezacharias$sftm$Dialog_Scratch$RightSelection = {ctor: 'RightSelection'};
var _ezacharias$sftm$Dialog_Scratch$SymbolSelection = {ctor: 'SymbolSelection'};
var _ezacharias$sftm$Dialog_Scratch$init = F3(
	function (symbols, scratch, focus) {
		return {selection: _ezacharias$sftm$Dialog_Scratch$SymbolSelection, left: _elm_lang$core$Maybe$Nothing, symbol: _elm_lang$core$Maybe$Nothing, right: _elm_lang$core$Maybe$Nothing, symbols: symbols, scratch: scratch, focus: focus};
	});
var _ezacharias$sftm$Dialog_Scratch$LeftSelection = {ctor: 'LeftSelection'};
var _ezacharias$sftm$Dialog_Scratch$SelectionClickedMsg = function (a) {
	return {ctor: 'SelectionClickedMsg', _0: a};
};
var _ezacharias$sftm$Dialog_Scratch$leftButtonView = function (model) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'circle-button-2',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_ezacharias$sftm$Dialog_Scratch$selectedClass(
							_elm_lang$core$Native_Utils.eq(model.selection, _ezacharias$sftm$Dialog_Scratch$LeftSelection)),
						_ezacharias$sftm$Dialog_Scratch$hiddenClass(
							_ezacharias$sftm$Dialog_Scratch$isHidden(model))))),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onClick(
					_ezacharias$sftm$Dialog_Scratch$SelectionClickedMsg(_ezacharias$sftm$Dialog_Scratch$LeftSelection)),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _ezacharias$sftm$Render$centerTermDiv(
				_ezacharias$sftm$Term$Atom(
					_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
			_1: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Dialog_Scratch$symbolButtonView = function (model) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'circle-button-2',
					_ezacharias$sftm$Dialog_Scratch$selectedClass(
						_elm_lang$core$Native_Utils.eq(model.selection, _ezacharias$sftm$Dialog_Scratch$SymbolSelection)))),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onClick(
					_ezacharias$sftm$Dialog_Scratch$SelectionClickedMsg(_ezacharias$sftm$Dialog_Scratch$SymbolSelection)),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _ezacharias$sftm$Render$starDiv,
			_1: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Dialog_Scratch$rightButtonView = function (model) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'circle-button-2',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_ezacharias$sftm$Dialog_Scratch$selectedClass(
							_elm_lang$core$Native_Utils.eq(model.selection, _ezacharias$sftm$Dialog_Scratch$RightSelection)),
						_ezacharias$sftm$Dialog_Scratch$hiddenClass(
							_ezacharias$sftm$Dialog_Scratch$isHidden(model))))),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onClick(
					_ezacharias$sftm$Dialog_Scratch$SelectionClickedMsg(_ezacharias$sftm$Dialog_Scratch$RightSelection)),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _ezacharias$sftm$Render$centerTermDiv(
				_ezacharias$sftm$Term$Atom(
					_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
			_1: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Dialog_Scratch$CancelClickedMsg = {ctor: 'CancelClickedMsg'};
var _ezacharias$sftm$Dialog_Scratch$OkClickedMsg = {ctor: 'OkClickedMsg'};
var _ezacharias$sftm$Dialog_Scratch$ListItemClickedMsg = function (a) {
	return {ctor: 'ListItemClickedMsg', _0: a};
};
var _ezacharias$sftm$Dialog_Scratch$itemView = F3(
	function (isSelected, idx, svg) {
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'term-item',
						_ezacharias$sftm$Dialog_Scratch$selectedClass(
							isSelected(idx)))),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						_ezacharias$sftm$Dialog_Scratch$ListItemClickedMsg(idx)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: svg,
				_1: {ctor: '[]'}
			});
	});
var _ezacharias$sftm$Dialog_Scratch$symbolListView = F2(
	function (selection, symbols) {
		return A2(
			_elm_lang$html$Html$ul,
			{ctor: '[]'},
			A2(
				_elm_lang$core$List$indexedMap,
				_ezacharias$sftm$Dialog_Scratch$itemView(
					_ezacharias$sftm$Dialog_Scratch$isSelected(selection)),
				A2(_elm_lang$core$List$map, _ezacharias$sftm$Render$symbolSvg, symbols)));
	});
var _ezacharias$sftm$Dialog_Scratch$scratchListView = F2(
	function (selection, scratch) {
		return A2(
			_elm_lang$html$Html$ul,
			{ctor: '[]'},
			A2(
				_elm_lang$core$List$indexedMap,
				_ezacharias$sftm$Dialog_Scratch$itemView(
					_ezacharias$sftm$Dialog_Scratch$isSelected(selection)),
				A2(_elm_lang$core$List$map, _ezacharias$sftm$Render$leftTermDiv, scratch)));
	});
var _ezacharias$sftm$Dialog_Scratch$listView = function (model) {
	var _p9 = model.selection;
	switch (_p9.ctor) {
		case 'LeftSelection':
			return A2(_ezacharias$sftm$Dialog_Scratch$scratchListView, model.left, model.scratch);
		case 'SymbolSelection':
			return A2(_ezacharias$sftm$Dialog_Scratch$symbolListView, model.symbol, model.symbols);
		default:
			return A2(_ezacharias$sftm$Dialog_Scratch$scratchListView, model.right, model.scratch);
	}
};
var _ezacharias$sftm$Dialog_Scratch$view = function (model) {
	var right = A2(
		_elm_lang$core$Maybe$map,
		function (i) {
			return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.scratch);
		},
		model.right);
	var symbol = A2(
		_elm_lang$core$Maybe$map,
		function (i) {
			return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.symbols);
		},
		model.symbol);
	var left = A2(
		_elm_lang$core$Maybe$map,
		function (i) {
			return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.scratch);
		},
		model.left);
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('content-body'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('nav-bar'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('top-title'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Scratch Pad Add'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{ctor: '[]'},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('main-formula'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _ezacharias$sftm$Render$formulaHtml0(
							A4(_ezacharias$sftm$Dialog_Scratch$formula, model.focus, left, symbol, right)),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('dialog-control'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('basic'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Dialog_Scratch$CancelClickedMsg),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Cancel'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '8px'},
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('basic'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$disabled(
													!A3(_ezacharias$sftm$Dialog_Scratch$isValid, left, symbol, right)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Dialog_Scratch$OkClickedMsg),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('OK'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('dialog-command'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _ezacharias$sftm$Dialog_Scratch$leftButtonView(model),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Dialog_Scratch$symbolButtonView(model),
									_1: {
										ctor: '::',
										_0: _ezacharias$sftm$Dialog_Scratch$rightButtonView(model),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('scrolling'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-body'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _ezacharias$sftm$Dialog_Scratch$listView(model),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _ezacharias$sftm$Dialog_Scratch$IgnoreMsg = {ctor: 'IgnoreMsg'};
var _ezacharias$sftm$Dialog_Scratch$AddOut = function (a) {
	return {ctor: 'AddOut', _0: a};
};
var _ezacharias$sftm$Dialog_Scratch$ExitOut = {ctor: 'ExitOut'};
var _ezacharias$sftm$Dialog_Scratch$ChangedCmdOut = F2(
	function (a, b) {
		return {ctor: 'ChangedCmdOut', _0: a, _1: b};
	});
var _ezacharias$sftm$Dialog_Scratch$ChangedOut = function (a) {
	return {ctor: 'ChangedOut', _0: a};
};
var _ezacharias$sftm$Dialog_Scratch$NoChangeOut = {ctor: 'NoChangeOut'};
var _ezacharias$sftm$Dialog_Scratch$update = F2(
	function (msg, model) {
		var _p10 = msg;
		switch (_p10.ctor) {
			case 'IgnoreMsg':
				return _ezacharias$sftm$Dialog_Scratch$NoChangeOut;
			case 'ListItemClickedMsg':
				var _p12 = _p10._0;
				var _p11 = model.selection;
				switch (_p11.ctor) {
					case 'LeftSelection':
						return _ezacharias$sftm$Dialog_Scratch$ChangedOut(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									left: A2(_ezacharias$sftm$Dialog_Scratch$toggle, _p12, model.left)
								}));
					case 'SymbolSelection':
						return _ezacharias$sftm$Dialog_Scratch$ChangedOut(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									symbol: A2(_ezacharias$sftm$Dialog_Scratch$toggle, _p12, model.symbol)
								}));
					default:
						return _ezacharias$sftm$Dialog_Scratch$ChangedOut(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									right: A2(_ezacharias$sftm$Dialog_Scratch$toggle, _p12, model.right)
								}));
				}
			case 'CancelClickedMsg':
				return _ezacharias$sftm$Dialog_Scratch$ExitOut;
			case 'OkClickedMsg':
				var right = A2(
					_elm_lang$core$Maybe$map,
					function (i) {
						return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.scratch);
					},
					model.right);
				var symbol = A2(
					_elm_lang$core$Maybe$map,
					function (i) {
						return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.symbols);
					},
					model.symbol);
				var left = A2(
					_elm_lang$core$Maybe$map,
					function (i) {
						return A2(_ezacharias$sftm$Utilities$unsafeGet, i, model.scratch);
					},
					model.left);
				return _ezacharias$sftm$Dialog_Scratch$AddOut(
					A4(_ezacharias$sftm$Dialog_Scratch$formula, model.focus, left, symbol, right));
			default:
				return A2(
					_ezacharias$sftm$Dialog_Scratch$ChangedCmdOut,
					_elm_lang$core$Native_Utils.update(
						model,
						{selection: _p10._0}),
					_ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Dialog_Scratch$IgnoreMsg));
		}
	});

var _ezacharias$sftm$Transformations$clearDictionary = _elm_lang$core$List$map(
	function (_p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: {ctor: '[]'}
		};
	});
var _ezacharias$sftm$Transformations$lookup = F2(
	function (m1, dict) {
		lookup:
		while (true) {
			var _p2 = dict;
			if (_p2.ctor === '[]') {
				return _elm_lang$core$Native_Utils.crashCase(
					'Transformations',
					{
						start: {line: 362, column: 5},
						end: {line: 376, column: 32}
					},
					_p2)('impossible');
			} else {
				if ((_p2._0._1.ctor === '::') && (_p2._0._1._1.ctor === '[]')) {
					if (_elm_lang$core$Native_Utils.eq(m1, _p2._0._0)) {
						return _p2._0._1._0;
					} else {
						var _v2 = m1,
							_v3 = _p2._1;
						m1 = _v2;
						dict = _v3;
						continue lookup;
					}
				} else {
					if (_elm_lang$core$Native_Utils.eq(m1, _p2._0._0)) {
						return _ezacharias$sftm$Term$Atom(
							_ezacharias$sftm$Term$MetaVar(m1));
					} else {
						var _v4 = m1,
							_v5 = _p2._1;
						m1 = _v4;
						dict = _v5;
						continue lookup;
					}
				}
			}
		}
	});
var _ezacharias$sftm$Transformations$dictionaryAddScratch = function (scratch) {
	var f = function (_p4) {
		var _p5 = _p4;
		var _p7 = _p5._1;
		var _p6 = _p5._0;
		return _elm_lang$core$List$isEmpty(_p7) ? {ctor: '_Tuple2', _0: _p6, _1: scratch} : {ctor: '_Tuple2', _0: _p6, _1: _p7};
	};
	return _elm_lang$core$List$map(f);
};
var _ezacharias$sftm$Transformations$dictionaryHasEmpty = _elm_lang$core$List$any(
	function (_p8) {
		var _p9 = _p8;
		return _elm_lang$core$List$isEmpty(_p9._1);
	});
var _ezacharias$sftm$Transformations$substitute = F2(
	function (dict, term) {
		var _p10 = term;
		switch (_p10.ctor) {
			case 'Atom':
				if (_p10._0.ctor === 'MetaVar') {
					return A2(_ezacharias$sftm$Transformations$lookup, _p10._0._0, dict);
				} else {
					return _ezacharias$sftm$Term$Atom(_p10._0);
				}
			case 'Unary':
				return A2(
					_ezacharias$sftm$Term$Unary,
					_p10._0,
					A2(_ezacharias$sftm$Transformations$substitute, dict, _p10._1));
			default:
				return A3(
					_ezacharias$sftm$Term$Binary,
					_p10._0,
					A2(_ezacharias$sftm$Transformations$substitute, dict, _p10._1),
					A2(_ezacharias$sftm$Transformations$substitute, dict, _p10._2));
		}
	});
var _ezacharias$sftm$Transformations$isSingleton = function (xs) {
	var _p11 = xs;
	if ((_p11.ctor === '::') && (_p11._1.ctor === '[]')) {
		return true;
	} else {
		return false;
	}
};
var _ezacharias$sftm$Transformations$uniq = F2(
	function (ts1, ts2) {
		uniq:
		while (true) {
			var _p12 = {ctor: '_Tuple2', _0: ts1, _1: ts2};
			if (_p12._0.ctor === '[]') {
				return _p12._1;
			} else {
				if (_p12._0._1.ctor === '[]') {
					if (_p12._1.ctor === '[]') {
						return {
							ctor: '::',
							_0: _p12._0._0,
							_1: {ctor: '[]'}
						};
					} else {
						var _p15 = _p12._1._1;
						var _p14 = _p12._1._0;
						var _p13 = _p12._0._0;
						return _elm_lang$core$Native_Utils.eq(_p13, _p14) ? {ctor: '::', _0: _p14, _1: _p15} : {
							ctor: '::',
							_0: _p14,
							_1: A2(
								_ezacharias$sftm$Transformations$uniq,
								{
									ctor: '::',
									_0: _p13,
									_1: {ctor: '[]'}
								},
								_p15)
						};
					}
				} else {
					var _v11 = _p12._0._1,
						_v12 = A2(
						_ezacharias$sftm$Transformations$uniq,
						{
							ctor: '::',
							_0: _p12._0._0,
							_1: {ctor: '[]'}
						},
						_p12._1);
					ts1 = _v11;
					ts2 = _v12;
					continue uniq;
				}
			}
		}
	});
var _ezacharias$sftm$Transformations$dictionaryMerge = F2(
	function (d1, d2) {
		var f = F2(
			function (_p17, _p16) {
				var _p18 = _p17;
				var _p19 = _p16;
				return {
					ctor: '_Tuple2',
					_0: _p18._0,
					_1: A2(_ezacharias$sftm$Transformations$uniq, _p18._1, _p19._1)
				};
			});
		return A3(_elm_lang$core$List$map2, f, d1, d2);
	});
var _ezacharias$sftm$Transformations$restrict = F4(
	function (rule, sub, context, dict) {
		var recur = F3(
			function (attempt, dict, result) {
				var _p20 = dict;
				if (_p20.ctor === '[]') {
					return A2(
						_elm_lang$core$List$all,
						function (ant) {
							var t1 = A2(_ezacharias$sftm$Transformations$substitute, attempt, ant);
							return A2(
								_elm_lang$core$List$any,
								function (t2) {
									return _elm_lang$core$Native_Utils.eq(t1, t2);
								},
								context);
						},
						rule.antecedents) ? A2(_ezacharias$sftm$Transformations$dictionaryMerge, attempt, result) : result;
				} else {
					return A3(
						_elm_lang$core$List$foldl,
						function (term) {
							return A2(
								recur,
								{
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: _p20._0._0,
										_1: {
											ctor: '::',
											_0: term,
											_1: {ctor: '[]'}
										}
									},
									_1: attempt
								},
								_p20._1);
						},
						result,
						_p20._0._1);
				}
			});
		return A3(
			recur,
			{ctor: '[]'},
			dict,
			_ezacharias$sftm$Transformations$clearDictionary(dict));
	});
var _ezacharias$sftm$Transformations$everyScratch2 = F3(
	function (p, scratch, dict) {
		var f = F3(
			function (dict1, dict2, result) {
				f:
				while (true) {
					var _p21 = dict1;
					if (_p21.ctor === '[]') {
						return p(dict2) ? A2(_ezacharias$sftm$Transformations$dictionaryMerge, result, dict2) : result;
					} else {
						if (_p21._0._1.ctor === '[]') {
							return A3(
								_elm_lang$core$List$foldr,
								function (t) {
									return A2(
										f,
										_p21._1,
										{
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: _p21._0._0,
												_1: {
													ctor: '::',
													_0: t,
													_1: {ctor: '[]'}
												}
											},
											_1: dict2
										});
								},
								result,
								scratch);
						} else {
							var _v17 = _p21._1,
								_v18 = {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _p21._0._0, _1: _p21._0._1},
								_1: dict2
							},
								_v19 = result;
							dict1 = _v17;
							dict2 = _v18;
							result = _v19;
							continue f;
						}
					}
				}
			});
		return A2(
			f,
			_elm_lang$core$List$reverse(dict),
			{ctor: '[]'});
	});
var _ezacharias$sftm$Transformations$dictionaryAddUnique = F3(
	function (v1, t1, dict) {
		var _p22 = dict;
		if (_p22.ctor === '[]') {
			return _elm_lang$core$Native_Utils.crashCase(
				'Transformations',
				{
					start: {line: 266, column: 5},
					end: {line: 286, column: 37}
				},
				_p22)('impossible');
		} else {
			if (_p22._0._1.ctor === '[]') {
				var _p25 = _p22._0._0;
				var _p24 = _p22._1;
				return _elm_lang$core$Native_Utils.eq(v1, _p25) ? _elm_lang$core$Maybe$Just(
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _p25,
							_1: {
								ctor: '::',
								_0: t1,
								_1: {ctor: '[]'}
							}
						},
						_1: _p24
					}) : A2(
					_elm_lang$core$Maybe$map,
					function (d) {
						return {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p25,
								_1: {ctor: '[]'}
							},
							_1: d
						};
					},
					A3(_ezacharias$sftm$Transformations$dictionaryAddUnique, v1, t1, _p24));
			} else {
				if (_p22._0._1._1.ctor === '[]') {
					var _p28 = _p22._0._0;
					var _p27 = _p22._0._1._0;
					var _p26 = _p22._1;
					return _elm_lang$core$Native_Utils.eq(v1, _p28) ? (_elm_lang$core$Native_Utils.eq(t1, _p27) ? _elm_lang$core$Maybe$Just(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p28,
								_1: {
									ctor: '::',
									_0: _p27,
									_1: {ctor: '[]'}
								}
							},
							_1: _p26
						}) : _elm_lang$core$Maybe$Nothing) : A2(
						_elm_lang$core$Maybe$map,
						function (d) {
							return {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p28,
									_1: {
										ctor: '::',
										_0: _p27,
										_1: {ctor: '[]'}
									}
								},
								_1: d
							};
						},
						A3(_ezacharias$sftm$Transformations$dictionaryAddUnique, v1, t1, _p26));
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Transformations',
						{
							start: {line: 266, column: 5},
							end: {line: 286, column: 37}
						},
						_p22)('impossible');
				}
			}
		}
	});
var _ezacharias$sftm$Transformations$target = function (x) {
	var _p30 = x.direction;
	if (_p30.ctor === 'Leftwards') {
		return x.rule.left;
	} else {
		return x.rule.right;
	}
};
var _ezacharias$sftm$Transformations$origin = function (x) {
	var _p31 = x.direction;
	if (_p31.ctor === 'Leftwards') {
		return x.rule.right;
	} else {
		return x.rule.left;
	}
};
var _ezacharias$sftm$Transformations$isPossible = function (x) {
	return A2(
		_elm_lang$core$List$all,
		function (_p32) {
			var _p33 = _p32;
			return !_elm_lang$core$List$isEmpty(_p33._1);
		},
		x.dictionary);
};
var _ezacharias$sftm$Transformations$addScratch = F2(
	function (scratch, x) {
		var f = function (_p34) {
			var _p35 = _p34;
			var _p37 = _p35._1;
			var _p36 = _p35._0;
			return _elm_lang$core$List$isEmpty(_p37) ? {ctor: '_Tuple2', _0: _p36, _1: scratch} : {ctor: '_Tuple2', _0: _p36, _1: _p37};
		};
		return _elm_lang$core$Native_Utils.update(
			x,
			{
				dictionary: A2(_elm_lang$core$List$map, f, x.dictionary)
			});
	});
var _ezacharias$sftm$Transformations$checkDictionary = F4(
	function (focus, scratch, target, dict) {
		if (_ezacharias$sftm$Transformations$dictionaryHasEmpty(dict)) {
			var _p38 = scratch;
			if (_p38.ctor === '[]') {
				return false;
			} else {
				if (_p38._1.ctor === '[]') {
					return !_elm_lang$core$Native_Utils.eq(
						focus,
						A2(
							_ezacharias$sftm$Transformations$substitute,
							A2(_ezacharias$sftm$Transformations$dictionaryAddScratch, scratch, dict),
							target));
				} else {
					return true;
				}
			}
		} else {
			return !_elm_lang$core$Native_Utils.eq(
				focus,
				A2(_ezacharias$sftm$Transformations$substitute, dict, target));
		}
	});
var _ezacharias$sftm$Transformations$everyScratch = F3(
	function (p, scratch, dict) {
		var f = F3(
			function (dict1, dict2, result) {
				f:
				while (true) {
					var _p39 = dict1;
					if (_p39.ctor === '[]') {
						if (p(dict2)) {
							var _p40 = result;
							if (_p40.ctor === 'Nothing') {
								return _elm_lang$core$Maybe$Just(dict2);
							} else {
								return _elm_lang$core$Maybe$Just(
									A2(_ezacharias$sftm$Transformations$dictionaryMerge, _p40._0, dict2));
							}
						} else {
							return result;
						}
					} else {
						if (_p39._0._1.ctor === '[]') {
							return A3(
								_elm_lang$core$List$foldr,
								function (t) {
									return A2(
										f,
										_p39._1,
										{
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: _p39._0._0,
												_1: {
													ctor: '::',
													_0: t,
													_1: {ctor: '[]'}
												}
											},
											_1: dict2
										});
								},
								result,
								scratch);
						} else {
							var _v28 = _p39._1,
								_v29 = {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _p39._0._0, _1: _p39._0._1},
								_1: dict2
							},
								_v30 = result;
							dict1 = _v28;
							dict2 = _v29;
							result = _v30;
							continue f;
						}
					}
				}
			});
		return A2(
			f,
			_elm_lang$core$List$reverse(dict),
			{ctor: '[]'});
	});
var _ezacharias$sftm$Transformations$unify = F3(
	function (focus, term, dict) {
		unify:
		while (true) {
			var _p41 = {ctor: '_Tuple2', _0: focus, _1: term};
			_v31_7:
			do {
				_v31_0:
				do {
					switch (_p41._1.ctor) {
						case 'Atom':
							if (_p41._1._0.ctor === 'MetaVar') {
								switch (_p41._1._0._0.ctor) {
									case 'MetaA':
										if ((_p41._0.ctor === 'Atom') && (_p41._0._0.ctor === 'MetaVar')) {
											break _v31_0;
										} else {
											return A3(_ezacharias$sftm$Transformations$dictionaryAddUnique, _ezacharias$sftm$Term$MetaA, _p41._0, dict);
										}
									case 'MetaB':
										if ((_p41._0.ctor === 'Atom') && (_p41._0._0.ctor === 'MetaVar')) {
											break _v31_0;
										} else {
											return A3(_ezacharias$sftm$Transformations$dictionaryAddUnique, _ezacharias$sftm$Term$MetaB, _p41._0, dict);
										}
									default:
										if ((_p41._0.ctor === 'Atom') && (_p41._0._0.ctor === 'MetaVar')) {
											break _v31_0;
										} else {
											return A3(_ezacharias$sftm$Transformations$dictionaryAddUnique, _ezacharias$sftm$Term$MetaC, _p41._0, dict);
										}
								}
							} else {
								if (_p41._0.ctor === 'Atom') {
									if (_p41._0._0.ctor === 'MetaVar') {
										break _v31_0;
									} else {
										return _elm_lang$core$Native_Utils.eq(_p41._0._0, _p41._1._0) ? _elm_lang$core$Maybe$Just(dict) : _elm_lang$core$Maybe$Nothing;
									}
								} else {
									break _v31_7;
								}
							}
						case 'Unary':
							switch (_p41._0.ctor) {
								case 'Atom':
									if (_p41._0._0.ctor === 'MetaVar') {
										break _v31_0;
									} else {
										break _v31_7;
									}
								case 'Unary':
									if (_elm_lang$core$Native_Utils.eq(_p41._0._0, _p41._1._0)) {
										var _v32 = _p41._0._1,
											_v33 = _p41._1._1,
											_v34 = dict;
										focus = _v32;
										term = _v33;
										dict = _v34;
										continue unify;
									} else {
										return _elm_lang$core$Maybe$Nothing;
									}
								default:
									break _v31_7;
							}
						default:
							switch (_p41._0.ctor) {
								case 'Atom':
									if (_p41._0._0.ctor === 'MetaVar') {
										break _v31_0;
									} else {
										break _v31_7;
									}
								case 'Binary':
									return _elm_lang$core$Native_Utils.eq(_p41._0._0, _p41._1._0) ? A2(
										_elm_lang$core$Maybe$andThen,
										A2(_ezacharias$sftm$Transformations$unify, _p41._0._2, _p41._1._2),
										A3(_ezacharias$sftm$Transformations$unify, _p41._0._1, _p41._1._1, dict)) : _elm_lang$core$Maybe$Nothing;
								default:
									break _v31_7;
							}
					}
				} while(false);
				return _elm_lang$core$Maybe$Just(dict);
			} while(false);
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _ezacharias$sftm$Transformations$antecedents = F4(
	function (focus, scratch, context, x) {
		var f = F4(
			function (antecedents, dict, term, result) {
				var _p42 = antecedents;
				if (_p42.ctor === '[]') {
					return A4(
						_ezacharias$sftm$Transformations$everyScratch,
						function (dict) {
							return !_elm_lang$core$Native_Utils.eq(
								focus,
								A2(
									_ezacharias$sftm$Transformations$substitute,
									dict,
									_ezacharias$sftm$Transformations$target(x)));
						},
						scratch,
						dict,
						result);
				} else {
					var _p43 = A3(_ezacharias$sftm$Transformations$unify, term, _p42._0, dict);
					if (_p43.ctor === 'Nothing') {
						return result;
					} else {
						return A3(
							_elm_lang$core$List$foldl,
							A2(f, _p42._1, _p43._0),
							result,
							context);
					}
				}
			});
		var result = A3(
			_elm_lang$core$List$foldl,
			A2(f, x.rule.antecedents, x.dictionary),
			_elm_lang$core$Maybe$Nothing,
			context);
		return A2(
			_elm_lang$core$Maybe$map,
			function (d) {
				return _elm_lang$core$Native_Utils.update(
					x,
					{dictionary: d});
			},
			result);
	});
var _ezacharias$sftm$Transformations$reallyAntecedents = F6(
	function (focus, right, scratch, context, antecedents, dict) {
		var f = F4(
			function (antecedents, dict, term, result) {
				var _p44 = antecedents;
				if (_p44.ctor === '[]') {
					return A4(
						_ezacharias$sftm$Transformations$everyScratch2,
						function (dict) {
							return !_elm_lang$core$Native_Utils.eq(
								focus,
								A2(_ezacharias$sftm$Transformations$substitute, dict, right));
						},
						scratch,
						dict,
						result);
				} else {
					var _p45 = A3(_ezacharias$sftm$Transformations$unify, term, _p44._0, dict);
					if (_p45.ctor === 'Nothing') {
						return result;
					} else {
						return A3(
							_elm_lang$core$List$foldr,
							A2(f, _p44._1, _p45._0),
							result,
							context);
					}
				}
			});
		return A3(
			_elm_lang$core$List$foldr,
			A2(f, antecedents, dict),
			dict,
			context);
	});
var _ezacharias$sftm$Transformations$performUnification = F2(
	function (focus, x) {
		return A2(
			_elm_lang$core$Maybe$map,
			function (d) {
				return _elm_lang$core$Native_Utils.update(
					x,
					{dictionary: d});
			},
			A3(
				_ezacharias$sftm$Transformations$unify,
				focus,
				_ezacharias$sftm$Transformations$origin(x),
				x.dictionary));
	});
var _ezacharias$sftm$Transformations$addDictionary = function (x) {
	var dictionary = A3(
		_elm_lang$core$List$foldl,
		_ezacharias$sftm$Term$addMetavariables,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: x.rule.left,
			_1: {ctor: '::', _0: x.rule.right, _1: x.rule.antecedents}
		});
	return {rule: x.rule, direction: x.direction, dictionary: dictionary};
};
var _ezacharias$sftm$Transformations$fromRule = function (rule) {
	return {name: rule.name, isSymmetric: rule.isSymmetric, antecedents: rule.antecedents, left: rule.left, right: rule.right};
};
var _ezacharias$sftm$Transformations$toRule = F2(
	function (idx, rule) {
		return {name: rule.name, isSymmetric: rule.isSymmetric, antecedents: rule.antecedents, left: rule.left, right: rule.right, index: idx};
	});
var _ezacharias$sftm$Transformations$Rule = F6(
	function (a, b, c, d, e, f) {
		return {name: a, isSymmetric: b, antecedents: c, left: d, right: e, index: f};
	});
var _ezacharias$sftm$Transformations$Rightwards = {ctor: 'Rightwards'};
var _ezacharias$sftm$Transformations$Leftwards = {ctor: 'Leftwards'};
var _ezacharias$sftm$Transformations$addDirection = F2(
	function (rule, xs) {
		return rule.isSymmetric ? {
			ctor: '::',
			_0: {rule: rule, direction: _ezacharias$sftm$Transformations$Rightwards},
			_1: xs
		} : {
			ctor: '::',
			_0: {rule: rule, direction: _ezacharias$sftm$Transformations$Rightwards},
			_1: {
				ctor: '::',
				_0: {rule: rule, direction: _ezacharias$sftm$Transformations$Leftwards},
				_1: xs
			}
		};
	});
var _ezacharias$sftm$Transformations$toTransformation = function (x) {
	return {
		isMultiple: A2(
			_elm_lang$core$List$any,
			function (_p46) {
				var _p47 = _p46;
				return !_ezacharias$sftm$Transformations$isSingleton(_p47._1);
			},
			x.dictionary),
		display: A2(
			_ezacharias$sftm$Transformations$substitute,
			x.dictionary,
			_ezacharias$sftm$Transformations$target(x)),
		isReversed: _elm_lang$core$Native_Utils.eq(x.direction, _ezacharias$sftm$Transformations$Leftwards),
		ruleIndex: x.rule.index
	};
};
var _ezacharias$sftm$Transformations$transformations = F4(
	function (rules, scratch, context, focus) {
		return A2(
			_elm_lang$core$List$map,
			_ezacharias$sftm$Transformations$toTransformation,
			A2(
				_elm_lang$core$List$filter,
				_ezacharias$sftm$Transformations$isPossible,
				A2(
					_elm_lang$core$List$filterMap,
					A3(
						_ezacharias$sftm$Transformations$antecedents,
						focus,
						scratch,
						{
							ctor: '::',
							_0: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
							_1: context
						}),
					A2(
						_elm_lang$core$List$filterMap,
						_ezacharias$sftm$Transformations$performUnification(focus),
						A2(
							_elm_lang$core$List$map,
							_ezacharias$sftm$Transformations$addDictionary,
							A3(
								_elm_lang$core$List$foldr,
								_ezacharias$sftm$Transformations$addDirection,
								{ctor: '[]'},
								A2(_elm_lang$core$List$indexedMap, _ezacharias$sftm$Transformations$toRule, rules)))))));
	});

var _ezacharias$sftm$Dialog_Transformation$selectedClass = function (b) {
	return b ? ' selected' : '';
};
var _ezacharias$sftm$Dialog_Transformation$init = F5(
	function (focus, context, scratch, rule, transformation) {
		var emptyDict = A2(
			_ezacharias$sftm$Term$addMetavariables,
			transformation.display,
			{ctor: '[]'});
		var replaceDict = _ezacharias$sftm$Term$occupy(
			_ezacharias$sftm$Utilities$fromJust(
				A3(
					_ezacharias$sftm$Transformations$unify,
					focus,
					rule.left,
					A2(
						_ezacharias$sftm$Term$addMetavariables,
						rule.left,
						_ezacharias$sftm$Utilities$fromJust(
							A3(_ezacharias$sftm$Transformations$unify, transformation.display, rule.right, emptyDict))))));
		var antecedents1 = A2(
			_elm_lang$core$List$map,
			_ezacharias$sftm$Transformations$substitute(replaceDict),
			rule.antecedents);
		var dict1 = A6(_ezacharias$sftm$Transformations$reallyAntecedents, focus, rule.right, scratch, context, antecedents1, emptyDict);
		var fullDict = A2(_ezacharias$sftm$Transformations$dictionaryAddScratch, scratch, dict1);
		var _p0 = function () {
			var _p1 = fullDict;
			if ((_p1.ctor === '::') && (_p1._1.ctor === '[]')) {
				return _p1._0;
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'Dialog.Transformation',
					{
						start: {line: 84, column: 13},
						end: {line: 89, column: 45}
					},
					_p1)('impossible');
			}
		}();
		var option = _p0._0;
		var options = _p0._1;
		return {display: transformation.display, option: option, options: options, selection: _elm_lang$core$Maybe$Nothing, rule: rule, transformation: transformation};
	});
var _ezacharias$sftm$Dialog_Transformation$Model = F6(
	function (a, b, c, d, e, f) {
		return {display: a, option: b, options: c, selection: d, rule: e, transformation: f};
	});
var _ezacharias$sftm$Dialog_Transformation$OkClickedMsg = {ctor: 'OkClickedMsg'};
var _ezacharias$sftm$Dialog_Transformation$CancelClickedMsg = {ctor: 'CancelClickedMsg'};
var _ezacharias$sftm$Dialog_Transformation$ListItemClickedMsg = function (a) {
	return {ctor: 'ListItemClickedMsg', _0: a};
};
var _ezacharias$sftm$Dialog_Transformation$itemView = F2(
	function (selection, option) {
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'term-item',
						_ezacharias$sftm$Dialog_Transformation$selectedClass(
							_elm_lang$core$Native_Utils.eq(
								selection,
								_elm_lang$core$Maybe$Just(option))))),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						_ezacharias$sftm$Dialog_Transformation$ListItemClickedMsg(option)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _ezacharias$sftm$Render$leftTermDiv(option),
				_1: {ctor: '[]'}
			});
	});
var _ezacharias$sftm$Dialog_Transformation$listView = F2(
	function (selection, options) {
		return A2(
			_elm_lang$html$Html$ul,
			{ctor: '[]'},
			A2(
				_elm_lang$core$List$map,
				_ezacharias$sftm$Dialog_Transformation$itemView(selection),
				options));
	});
var _ezacharias$sftm$Dialog_Transformation$EmptyMsg = {ctor: 'EmptyMsg'};
var _ezacharias$sftm$Dialog_Transformation$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('content-body'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('nav-bar'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('top-title'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Transformation'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{ctor: '[]'},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('main-formula'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _ezacharias$sftm$Render$formulaHtml0(model.display),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('dialog-control'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('basic'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Dialog_Transformation$CancelClickedMsg),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Cancel'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '8px'},
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('basic'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$disabled(
													_ezacharias$sftm$Utilities$isNothing(model.selection)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Dialog_Transformation$OkClickedMsg),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('OK'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('dialog-command'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('circle-button-2 selected'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Dialog_Transformation$EmptyMsg),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _ezacharias$sftm$Render$centerTermDiv(
											_ezacharias$sftm$Term$Atom(
												_ezacharias$sftm$Term$MetaVar(model.option))),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$id('scrolling'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-body'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(_ezacharias$sftm$Dialog_Transformation$listView, model.selection, model.options),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _ezacharias$sftm$Dialog_Transformation$OkOut = F2(
	function (a, b) {
		return {ctor: 'OkOut', _0: a, _1: b};
	});
var _ezacharias$sftm$Dialog_Transformation$CancelOut = {ctor: 'CancelOut'};
var _ezacharias$sftm$Dialog_Transformation$ChangedOut = function (a) {
	return {ctor: 'ChangedOut', _0: a};
};
var _ezacharias$sftm$Dialog_Transformation$EmptyOut = {ctor: 'EmptyOut'};
var _ezacharias$sftm$Dialog_Transformation$update = F2(
	function (msg, model) {
		var _p3 = msg;
		switch (_p3.ctor) {
			case 'EmptyMsg':
				return _ezacharias$sftm$Dialog_Transformation$EmptyOut;
			case 'ListItemClickedMsg':
				var _p4 = _p3._0;
				var newModel = _elm_lang$core$Native_Utils.eq(
					_elm_lang$core$Maybe$Just(_p4),
					model.selection) ? _elm_lang$core$Native_Utils.update(
					model,
					{display: model.transformation.display, selection: _elm_lang$core$Maybe$Nothing}) : _elm_lang$core$Native_Utils.update(
					model,
					{
						display: A2(
							_ezacharias$sftm$Transformations$substitute,
							{
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: model.option,
									_1: {
										ctor: '::',
										_0: _p4,
										_1: {ctor: '[]'}
									}
								},
								_1: {ctor: '[]'}
							},
							model.transformation.display),
						selection: _elm_lang$core$Maybe$Just(_p4)
					});
				return _ezacharias$sftm$Dialog_Transformation$ChangedOut(newModel);
			case 'CancelClickedMsg':
				return _ezacharias$sftm$Dialog_Transformation$CancelOut;
			default:
				return A2(_ezacharias$sftm$Dialog_Transformation$OkOut, model.transformation, model.display);
		}
	});

var _ezacharias$sftm$Page_About$view = F2(
	function (msg, version) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('content-body'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('nav-bar'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('nav-bar-button'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$title('Back'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(msg),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _ezacharias$sftm$Graphics$leftAngle,
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('grow'),
							_1: {ctor: '[]'}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('about-box'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('about-title'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Sympathy for the Machine'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('about-version'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'version ',
													_elm_lang$core$Basics$toString(version))),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('about-created'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Made by Edwin Zacharias'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('about-email'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$a,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$href('mailto:sftm@schlussweisen.com'),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('sftm@schlussweisen.com'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('grow-2'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('about-copyright'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Copyright © 2017 Edwin Zacharias. All rights reserved.'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
	});

var _ezacharias$sftm$Step$encoder = function (x) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'rule',
				_1: _elm_lang$core$Json_Encode$int(x.rule)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'isReversed',
					_1: _elm_lang$core$Json_Encode$bool(x.isReversed)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'term',
						_1: _ezacharias$sftm$Term$encoder(x.term)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _ezacharias$sftm$Step$Step = F3(
	function (a, b, c) {
		return {rule: a, isReversed: b, term: c};
	});
var _ezacharias$sftm$Step$decoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'term',
	_ezacharias$sftm$Term$decoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'isReversed',
		_elm_lang$core$Json_Decode$bool,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'rule',
			_elm_lang$core$Json_Decode$int,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_ezacharias$sftm$Step$Step))));

var _ezacharias$sftm$Problem$reset = function (problem) {
	return _elm_lang$core$Native_Utils.update(
		problem,
		{
			scratch: {ctor: '[]'},
			history: {ctor: '[]'},
			future: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Problem$restoreProblem = F2(
	function (x, p) {
		return _elm_lang$core$Native_Utils.update(
			p,
			{scratch: x.scratch, solved: x.solved, history: x.history, future: x.future, proof: x.proof});
	});
var _ezacharias$sftm$Problem$saveProblem = function (x) {
	return {scratch: x.scratch, solved: x.solved, history: x.history, future: x.future, proof: x.proof};
};
var _ezacharias$sftm$Problem$localStorageEncoder = function (x) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'scratch',
				_1: _elm_lang$core$Json_Encode$list(
					A2(_elm_lang$core$List$map, _ezacharias$sftm$Term$encoder, x.scratch))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'solved',
					_1: _elm_lang$core$Json_Encode$bool(x.solved)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'history',
						_1: _elm_lang$core$Json_Encode$list(
							A2(_elm_lang$core$List$map, _ezacharias$sftm$Step$encoder, x.history))
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'future',
							_1: _elm_lang$core$Json_Encode$list(
								A2(_elm_lang$core$List$map, _ezacharias$sftm$Step$encoder, x.future))
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'proof',
								_1: A2(
									_elm_lang$core$Maybe$withDefault,
									_elm_lang$core$Json_Encode$null,
									A2(
										_elm_lang$core$Maybe$map,
										function (_p0) {
											return _elm_lang$core$Json_Encode$list(
												A2(_elm_lang$core$List$map, _ezacharias$sftm$Step$encoder, _p0));
										},
										x.proof))
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _ezacharias$sftm$Problem$encoder = function (problem) {
	return _ezacharias$sftm$Problem$localStorageEncoder(
		_ezacharias$sftm$Problem$saveProblem(problem));
};
var _ezacharias$sftm$Problem$panelEncoder = function (_p1) {
	return _elm_lang$core$Json_Encode$object(
		{ctor: '[]'});
};
var _ezacharias$sftm$Problem$pathEncoder = function (_p2) {
	return _elm_lang$core$Json_Encode$object(
		{ctor: '[]'});
};
var _ezacharias$sftm$Problem$initProblem = function (problemStatic) {
	return {
		description: problemStatic.description,
		notes: problemStatic.notes,
		rules: problemStatic.rules,
		scratchSymbols: problemStatic.scratch,
		scratch: {ctor: '[]'},
		solved: false,
		start: problemStatic.start,
		finish: problemStatic.finish,
		history: {ctor: '[]'},
		future: {ctor: '[]'},
		proof: _elm_lang$core$Maybe$Nothing
	};
};
var _ezacharias$sftm$Problem$init = _elm_lang$core$List$map(_ezacharias$sftm$Problem$initProblem);
var _ezacharias$sftm$Problem$StaticProblem = F6(
	function (a, b, c, d, e, f) {
		return {description: a, notes: b, start: c, finish: d, rules: e, scratch: f};
	});
var _ezacharias$sftm$Problem$Problem = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {description: a, notes: b, rules: c, scratch: d, scratchSymbols: e, solved: f, start: g, finish: h, history: i, future: j, proof: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _ezacharias$sftm$Problem$LocalStorageProblem = F5(
	function (a, b, c, d, e) {
		return {scratch: a, solved: b, history: c, future: d, proof: e};
	});
var _ezacharias$sftm$Problem$localStorageDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'proof',
	_elm_lang$core$Json_Decode$nullable(
		_elm_lang$core$Json_Decode$list(_ezacharias$sftm$Step$decoder)),
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'future',
		_elm_lang$core$Json_Decode$list(_ezacharias$sftm$Step$decoder),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'history',
			_elm_lang$core$Json_Decode$list(_ezacharias$sftm$Step$decoder),
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'solved',
				_elm_lang$core$Json_Decode$bool,
				A3(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
					'scratch',
					_elm_lang$core$Json_Decode$list(_ezacharias$sftm$Term$decoder),
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_ezacharias$sftm$Problem$LocalStorageProblem))))));

var _ezacharias$sftm$Page_List$viewTombstone = function (isSolved) {
	return isSolved ? _ezacharias$sftm$Graphics$whiteTombstone : _ezacharias$sftm$Graphics$dashedTombstone;
};
var _ezacharias$sftm$Page_List$OnScrollMsg = {ctor: 'OnScrollMsg'};
var _ezacharias$sftm$Page_List$GoToAboutMsg = {ctor: 'GoToAboutMsg'};
var _ezacharias$sftm$Page_List$viewAbout = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('clickable listing-about-item'),
		_1: {
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_List$GoToAboutMsg),
			_1: {ctor: '[]'}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('About'),
		_1: {ctor: '[]'}
	});
var _ezacharias$sftm$Page_List$GoToProblemMsg = function (a) {
	return {ctor: 'GoToProblemMsg', _0: a};
};
var _ezacharias$sftm$Page_List$viewItem = F2(
	function (i, p) {
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('clickable listing-problem-item'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						_ezacharias$sftm$Page_List$GoToProblemMsg(i)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('listing-tombstone'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _ezacharias$sftm$Page_List$viewTombstone(p.solved),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('listing-description'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('listing-problem-text'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										A2(
											_elm_lang$core$Basics_ops['++'],
											'Problem ',
											_elm_lang$core$Basics$toString(i + 1))),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('listing-title-text'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(p.description),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _ezacharias$sftm$Page_List$view = function (ps) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('content-body'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$id('scrolling'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Utilities$onScroll(_ezacharias$sftm$Page_List$OnScrollMsg),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$ol,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('top-list'),
							_1: {ctor: '[]'}
						},
						A2(_elm_lang$core$List$indexedMap, _ezacharias$sftm$Page_List$viewItem, ps)),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_List$viewAbout,
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};

var _ezacharias$sftm$Page_Proof$viewStep = F4(
	function (formulaWidth, model, i, step) {
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('proof-step'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('proof-numbering'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							_elm_lang$core$Basics$toString(i + 1)),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('proof-formula'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'width',
											_1: A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(formulaWidth / 850),
												'em')
										},
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: _ezacharias$sftm$Render$leftTermDiv(step.term),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('proof-rule'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(_ezacharias$sftm$Utilities$unsafeGet, step.rule, model.rules).name,
										step.isReversed ? ' (reverse)' : '')),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _ezacharias$sftm$Page_Proof$viewStart = F2(
	function (formulaWidth, model) {
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('proof-step'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('proof-start'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Start '),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('proof-formula'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'width',
											_1: A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(formulaWidth / 850),
												'em')
										},
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: _ezacharias$sftm$Render$leftTermDiv(model.start),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _ezacharias$sftm$Page_Proof$view = F2(
	function (msg, model) {
		var shapes = A2(
			_elm_lang$core$List$map,
			function (_p0) {
				return _ezacharias$sftm$Render$midTermShape(
					function (_) {
						return _.term;
					}(_p0));
			},
			model.steps);
		var startShape = _ezacharias$sftm$Render$midTermShape(model.start);
		var width = A3(
			_elm_lang$core$List$foldl,
			_elm_lang$core$Basics$max,
			0,
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.width;
				},
				{ctor: '::', _0: startShape, _1: shapes}));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('content-body'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('nav-bar'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('nav-bar-button'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$title('Back'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(msg),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _ezacharias$sftm$Graphics$leftAngle,
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('scrolling'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('proof'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('proof-body'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('proof-description'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'Problem ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_elm_lang$core$Basics$toString(model.index + 1),
														A2(_elm_lang$core$Basics_ops['++'], ': ', model.name)))),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('proof-type'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Proof: By equivalence.'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$ol,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('proof-list'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A2(_ezacharias$sftm$Page_Proof$viewStart, width, model),
													_1: A2(
														_elm_lang$core$List$indexedMap,
														A2(_ezacharias$sftm$Page_Proof$viewStep, width, model),
														model.steps)
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$div,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('proof-tombstone'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _ezacharias$sftm$Graphics$whiteTombstone,
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _ezacharias$sftm$Page_Proof$Model = F5(
	function (a, b, c, d, e) {
		return {name: a, index: b, start: c, steps: d, rules: e};
	});

var _ezacharias$sftm$Ports$initialize = _elm_lang$core$Native_Platform.outgoingPort(
	'initialize',
	function (v) {
		return null;
	});
var _ezacharias$sftm$Ports$sendEvent = _elm_lang$core$Native_Platform.outgoingPort(
	'sendEvent',
	function (v) {
		return {category: v.category, action: v.action, label: v.label};
	});
var _ezacharias$sftm$Ports$problemSolved = function (x) {
	return _ezacharias$sftm$Ports$sendEvent(
		{
			category: A2(
				_elm_lang$core$Basics_ops['++'],
				'Problem-',
				A3(
					_elm_lang$core$String$padLeft,
					2,
					_elm_lang$core$Native_Utils.chr('0'),
					_elm_lang$core$Basics$toString(x.problemIndex + 1))),
			action: A2(
				_elm_lang$core$Basics_ops['++'],
				'Solved-',
				x.isInitial ? 'Initial' : 'Subsequent'),
			label: A2(
				_elm_lang$core$Basics_ops['++'],
				'Steps-',
				A3(
					_elm_lang$core$String$padLeft,
					3,
					_elm_lang$core$Native_Utils.chr('0'),
					_elm_lang$core$Basics$toString(
						A2(_elm_lang$core$Basics$min, x.stepCount, 250))))
		});
};
var _ezacharias$sftm$Ports$setPage = _elm_lang$core$Native_Platform.outgoingPort(
	'setPage',
	function (v) {
		return v;
	});
var _ezacharias$sftm$Ports$setLocalStorage = _elm_lang$core$Native_Platform.outgoingPort(
	'setLocalStorage',
	function (v) {
		return v;
	});
var _ezacharias$sftm$Ports$onLocalStorageChange = _elm_lang$core$Native_Platform.incomingPort(
	'onLocalStorageChange',
	_elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
				_1: {ctor: '[]'}
			}
		}));
var _ezacharias$sftm$Ports$copy = _elm_lang$core$Native_Platform.outgoingPort(
	'copy',
	function (v) {
		return v;
	});

var _ezacharias$sftm$Page_Solve$modelAriaHidden = function (model) {
	var _p0 = model.popUp;
	if (_p0.ctor === 'NoPopUp') {
		return _ezacharias$sftm$Utilities$ariaHidden(false);
	} else {
		return _ezacharias$sftm$Utilities$ariaHidden(true);
	}
};
var _ezacharias$sftm$Page_Solve$futureStep = F2(
	function (t, xs) {
		var _p1 = xs;
		if (_p1.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p1._1.ctor === '[]') {
				var _p2 = _p1._0;
				return {
					ctor: '::',
					_0: {rule: _p2.rule, isReversed: _p2.isReversed, term: t},
					_1: {ctor: '[]'}
				};
			} else {
				var _p4 = _p1._1._0;
				var _p3 = _p1._0;
				return {
					ctor: '::',
					_0: {rule: _p3.rule, isReversed: _p3.isReversed, term: _p4.term},
					_1: A2(
						_ezacharias$sftm$Page_Solve$futureStep,
						t,
						{ctor: '::', _0: _p4, _1: _p1._1._1})
				};
			}
		}
	});
var _ezacharias$sftm$Page_Solve$historyStep = F2(
	function (x, r) {
		return {ctor: '::', _0: x, _1: r};
	});
var _ezacharias$sftm$Page_Solve$proofSteps = F2(
	function (problem, model) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A3(
				_elm_lang$core$List$foldl,
				_ezacharias$sftm$Page_Solve$historyStep,
				{ctor: '[]'},
				A2(_elm_lang$core$List$drop, model.historyIndex, problem.history)),
			A2(
				_ezacharias$sftm$Page_Solve$futureStep,
				problem.finish,
				A2(_elm_lang$core$List$drop, model.futureIndex, problem.future)));
	});
var _ezacharias$sftm$Page_Solve$termReplace = F3(
	function (path, $new, term) {
		var _p5 = path;
		if (_p5.ctor === '[]') {
			return $new;
		} else {
			if (_p5._0.ctor === 'GoLeft') {
				var _p6 = term;
				switch (_p6.ctor) {
					case 'Binary':
						return A3(
							_ezacharias$sftm$Term$Binary,
							_p6._0,
							A3(_ezacharias$sftm$Page_Solve$termReplace, _p5._1, $new, _p6._1),
							_p6._2);
					case 'Unary':
						return _elm_lang$core$Native_Utils.crashCase(
							'Page.Solve',
							{
								start: {line: 1125, column: 13},
								end: {line: 1133, column: 45}
							},
							_p6)('impossible');
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'Page.Solve',
							{
								start: {line: 1125, column: 13},
								end: {line: 1133, column: 45}
							},
							_p6)('impossible');
				}
			} else {
				var _p11 = _p5._1;
				var _p9 = term;
				switch (_p9.ctor) {
					case 'Binary':
						return A3(
							_ezacharias$sftm$Term$Binary,
							_p9._0,
							_p9._1,
							A3(_ezacharias$sftm$Page_Solve$termReplace, _p11, $new, _p9._2));
					case 'Unary':
						return A2(
							_ezacharias$sftm$Term$Unary,
							_p9._0,
							A3(_ezacharias$sftm$Page_Solve$termReplace, _p11, $new, _p9._1));
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'Page.Solve',
							{
								start: {line: 1136, column: 13},
								end: {line: 1144, column: 45}
							},
							_p9)('impossible');
				}
			}
		}
	});
var _ezacharias$sftm$Page_Solve$currentTransformation = function (model) {
	var _p12 = model.transformationSelection;
	if (_p12.ctor === 'Nothing') {
		return _elm_lang$core$Native_Utils.crashCase(
			'Page.Solve',
			{
				start: {line: 1110, column: 5},
				end: {line: 1115, column: 58}
			},
			_p12)('impossible');
	} else {
		return A2(_ezacharias$sftm$Utilities$unsafeGet, _p12._0, model.transformations);
	}
};
var _ezacharias$sftm$Page_Solve$transformationIsMultiple = function (model) {
	var _p14 = model.transformationSelection;
	if (_p14.ctor === 'Nothing') {
		return false;
	} else {
		return A2(_ezacharias$sftm$Utilities$unsafeGet, _p14._0, model.transformations).isMultiple;
	}
};
var _ezacharias$sftm$Page_Solve$termFocus = F2(
	function (path, term) {
		termFocus:
		while (true) {
			var _p15 = path;
			if (_p15.ctor === '[]') {
				return term;
			} else {
				if (_p15._0.ctor === 'GoLeft') {
					var _p16 = term;
					switch (_p16.ctor) {
						case 'Binary':
							var _v9 = _p15._1,
								_v10 = _p16._1;
							path = _v9;
							term = _v10;
							continue termFocus;
						case 'Unary':
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1076, column: 13},
									end: {line: 1084, column: 45}
								},
								_p16)('impossible');
						default:
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1076, column: 13},
									end: {line: 1084, column: 45}
								},
								_p16)('impossible');
					}
				} else {
					var _p21 = _p15._1;
					var _p19 = term;
					switch (_p19.ctor) {
						case 'Binary':
							var _v12 = _p21,
								_v13 = _p19._2;
							path = _v12;
							term = _v13;
							continue termFocus;
						case 'Unary':
							var _v14 = _p21,
								_v15 = _p19._1;
							path = _v14;
							term = _v15;
							continue termFocus;
						default:
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1087, column: 13},
									end: {line: 1095, column: 45}
								},
								_p19)('impossible');
					}
				}
			}
		}
	});
var _ezacharias$sftm$Page_Solve$pushContextRight = F3(
	function (path, term, ctx) {
		pushContextRight:
		while (true) {
			var _p22 = term;
			if ((_p22.ctor === 'Binary') && (_p22._0.ctor === 'Conjunction')) {
				var _v17 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: path},
					_v18 = _p22._2,
					_v19 = A3(
					_ezacharias$sftm$Page_Solve$pushContextRight,
					{ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: path},
					_p22._1,
					ctx);
				path = _v17;
				term = _v18;
				ctx = _v19;
				continue pushContextRight;
			} else {
				return {
					ctor: '::',
					_0: {
						path: _elm_lang$core$List$reverse(path),
						term: term
					},
					_1: A2(
						_elm_lang$core$List$filter,
						function (x) {
							return !_elm_lang$core$Native_Utils.eq(x.term, term);
						},
						ctx)
				};
			}
		}
	});
var _ezacharias$sftm$Page_Solve$pushContextLeft = F3(
	function (path, term, ctx) {
		pushContextLeft:
		while (true) {
			var _p23 = term;
			if ((_p23.ctor === 'Binary') && (_p23._0.ctor === 'Conjunction')) {
				var _v21 = {ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: path},
					_v22 = _p23._1,
					_v23 = A3(
					_ezacharias$sftm$Page_Solve$pushContextLeft,
					{ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: path},
					_p23._2,
					ctx);
				path = _v21;
				term = _v22;
				ctx = _v23;
				continue pushContextLeft;
			} else {
				return {
					ctor: '::',
					_0: {
						path: _elm_lang$core$List$reverse(path),
						term: term
					},
					_1: A2(
						_elm_lang$core$List$filter,
						function (x) {
							return !_elm_lang$core$Native_Utils.eq(x.term, term);
						},
						ctx)
				};
			}
		}
	});
var _ezacharias$sftm$Page_Solve$pushNestedContext = F4(
	function (path, term, pathR, ctx) {
		pushNestedContext:
		while (true) {
			var _p24 = path;
			if (_p24.ctor === '[]') {
				return ctx;
			} else {
				if (_p24._0.ctor === 'GoLeft') {
					var _p28 = _p24._1;
					var _p25 = term;
					switch (_p25.ctor) {
						case 'Binary':
							switch (_p25._0.ctor) {
								case 'Conjunction':
									var _v26 = _p28,
										_v27 = _p25._1,
										_v28 = {ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_v29 = A3(
										_ezacharias$sftm$Page_Solve$pushContextLeft,
										{ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
										_p25._2,
										ctx);
									path = _v26;
									term = _v27;
									pathR = _v28;
									ctx = _v29;
									continue pushNestedContext;
								case 'Disjunction':
									var _v30 = _p28,
										_v31 = _p25._1,
										_v32 = {ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_v33 = ctx;
									path = _v30;
									term = _v31;
									pathR = _v32;
									ctx = _v33;
									continue pushNestedContext;
								case 'Equivalence':
									var _v34 = _p28,
										_v35 = _p25._1,
										_v36 = {ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_v37 = ctx;
									path = _v34;
									term = _v35;
									pathR = _v36;
									ctx = _v37;
									continue pushNestedContext;
								default:
									var _v38 = _p28,
										_v39 = _p25._1,
										_v40 = {ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_v41 = ctx;
									path = _v38;
									term = _v39;
									pathR = _v40;
									ctx = _v41;
									continue pushNestedContext;
							}
						case 'Unary':
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1005, column: 13},
									end: {line: 1022, column: 45}
								},
								_p25)('impossible');
						default:
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1005, column: 13},
									end: {line: 1022, column: 45}
								},
								_p25)('impossible');
					}
				} else {
					var _p31 = _p24._1;
					var _p29 = term;
					switch (_p29.ctor) {
						case 'Binary':
							switch (_p29._0.ctor) {
								case 'Conjunction':
									var _v43 = _p31,
										_v44 = _p29._2,
										_v45 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
										_v46 = A3(
										_ezacharias$sftm$Page_Solve$pushContextRight,
										{ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_p29._1,
										ctx);
									path = _v43;
									term = _v44;
									pathR = _v45;
									ctx = _v46;
									continue pushNestedContext;
								case 'Disjunction':
									var _v47 = _p31,
										_v48 = _p29._2,
										_v49 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
										_v50 = ctx;
									path = _v47;
									term = _v48;
									pathR = _v49;
									ctx = _v50;
									continue pushNestedContext;
								case 'Equivalence':
									var _v51 = _p31,
										_v52 = _p29._2,
										_v53 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
										_v54 = ctx;
									path = _v51;
									term = _v52;
									pathR = _v53;
									ctx = _v54;
									continue pushNestedContext;
								default:
									var _v55 = _p31,
										_v56 = _p29._2,
										_v57 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
										_v58 = A3(
										_ezacharias$sftm$Page_Solve$pushContextRight,
										{ctor: '::', _0: _ezacharias$sftm$Path$GoLeft, _1: pathR},
										_p29._1,
										ctx);
									path = _v55;
									term = _v56;
									pathR = _v57;
									ctx = _v58;
									continue pushNestedContext;
							}
						case 'Unary':
							var _v59 = _p31,
								_v60 = _p29._1,
								_v61 = {ctor: '::', _0: _ezacharias$sftm$Path$GoRight, _1: pathR},
								_v62 = ctx;
							path = _v59;
							term = _v60;
							pathR = _v61;
							ctx = _v62;
							continue pushNestedContext;
						default:
							return _elm_lang$core$Native_Utils.crashCase(
								'Page.Solve',
								{
									start: {line: 1025, column: 13},
									end: {line: 1042, column: 45}
								},
								_p29)('impossible');
					}
				}
			}
		}
	});
var _ezacharias$sftm$Page_Solve$currentTerm = F3(
	function (direction, problem, model) {
		var _p32 = direction;
		if (_p32.ctor === 'History') {
			var _p33 = A2(_elm_lang$core$List$drop, model.historyIndex, problem.history);
			if (_p33.ctor === '[]') {
				return problem.start;
			} else {
				return _p33._0.term;
			}
		} else {
			var _p34 = A2(_elm_lang$core$List$drop, model.futureIndex, problem.future);
			if (_p34.ctor === '[]') {
				return problem.finish;
			} else {
				return _p34._0.term;
			}
		}
	});
var _ezacharias$sftm$Page_Solve$flippedPath = function (model) {
	var _p35 = model.direction;
	if (_p35.ctor === 'History') {
		return model.futurePath;
	} else {
		return model.historyPath;
	}
};
var _ezacharias$sftm$Page_Solve$canFocusRight = function (model) {
	var _p36 = model.focus;
	switch (_p36.ctor) {
		case 'Binary':
			return true;
		case 'Unary':
			return true;
		default:
			return false;
	}
};
var _ezacharias$sftm$Page_Solve$canFocusOut = function (model) {
	var _p37 = model.path;
	if (_p37.ctor === '[]') {
		return false;
	} else {
		return true;
	}
};
var _ezacharias$sftm$Page_Solve$canFocusLeft = function (model) {
	var _p38 = model.focus;
	switch (_p38.ctor) {
		case 'Binary':
			return true;
		case 'Unary':
			return false;
		default:
			return false;
	}
};
var _ezacharias$sftm$Page_Solve$viewRulesPanel = F2(
	function (problem, model) {
		var f = F2(
			function (idx, rule) {
				return A2(
					_elm_lang$html$Html$li,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('rule-item'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('rule-name'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(rule.name),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Render$leftRuleDiv(rule),
							_1: {ctor: '[]'}
						}
					});
			});
		return A2(
			_elm_lang$html$Html$ul,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('scrolling'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(_elm_lang$core$List$indexedMap, f, problem.rules));
	});
var _ezacharias$sftm$Page_Solve$viewNotesPanel = F2(
	function (problem, model) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('scrolling'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('landscape-hide notes-panel-body'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$em,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(problem.description),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				A2(_elm_lang$core$List$map, _ezacharias$sftm$Utilities$castHtml, problem.notes)));
	});
var _ezacharias$sftm$Page_Solve$panelTitle = function (model) {
	var _p39 = model.panel;
	switch (_p39.ctor) {
		case 'NotesPanel':
			return 'Notes';
		case 'ContextPanel':
			return 'Context';
		case 'ScratchPanel':
			return 'Scratch Pad';
		case 'TransformationsPanel':
			return 'Transformations';
		case 'HistoryPanel':
			var _p40 = model.direction;
			if (_p40.ctor === 'History') {
				return 'History';
			} else {
				return 'Future';
			}
		default:
			return 'Rules';
	}
};
var _ezacharias$sftm$Page_Solve$canRedo = F2(
	function (problem, model) {
		var _p41 = model.direction;
		if (_p41.ctor === 'History') {
			return _elm_lang$core$Native_Utils.cmp(model.historyIndex, 0) > 0;
		} else {
			return _elm_lang$core$Native_Utils.cmp(model.futureIndex, 0) > 0;
		}
	});
var _ezacharias$sftm$Page_Solve$canUndo = F2(
	function (problem, model) {
		var _p42 = model.direction;
		if (_p42.ctor === 'History') {
			return _elm_lang$core$Native_Utils.cmp(
				model.historyIndex,
				_elm_lang$core$List$length(problem.history)) < 0;
		} else {
			return _elm_lang$core$Native_Utils.cmp(
				model.futureIndex,
				_elm_lang$core$List$length(problem.future)) < 0;
		}
	});
var _ezacharias$sftm$Page_Solve$focusColor = function (b) {
	return b ? 'White' : 'SlateGrey';
};
var _ezacharias$sftm$Page_Solve$metaClass = function (b) {
	return b ? ' meta' : '';
};
var _ezacharias$sftm$Page_Solve$selectedClass = function (b) {
	return b ? ' selected' : '';
};
var _ezacharias$sftm$Page_Solve$contextSelectionPath = function (model) {
	var _p43 = model.contextSelection;
	if (_p43.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return A2(_ezacharias$sftm$Utilities$unsafeGet, _p43._0, model.context).path;
	}
};
var _ezacharias$sftm$Page_Solve$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return {problemIndex: a, direction: b, historyIndex: c, futureIndex: d, historyPath: e, futurePath: f, panel: g, contextSelection: h, scratchSelection: i, transformationSelection: j, popUp: k, dialog: l, term: m, focus: n, context: o, path: p, transformations: q, solved: r};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _ezacharias$sftm$Page_Solve$CopyPopUp = {ctor: 'CopyPopUp'};
var _ezacharias$sftm$Page_Solve$ResetPopUp = {ctor: 'ResetPopUp'};
var _ezacharias$sftm$Page_Solve$SettingsPopUp = {ctor: 'SettingsPopUp'};
var _ezacharias$sftm$Page_Solve$PanelSelectPopUp = {ctor: 'PanelSelectPopUp'};
var _ezacharias$sftm$Page_Solve$NoPopUp = {ctor: 'NoPopUp'};
var _ezacharias$sftm$Page_Solve$HistoryItemMsg = function (a) {
	return {ctor: 'HistoryItemMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$viewHistoryPanel = F2(
	function (problem, model) {
		var f = F4(
			function (len, idx1, idx2, step) {
				return A2(
					_elm_lang$html$Html$li,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'history-item',
								_ezacharias$sftm$Page_Solve$selectedClass(
									_elm_lang$core$Native_Utils.eq(idx1, idx2)))),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(
								_ezacharias$sftm$Page_Solve$HistoryItemMsg(idx2)),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('history-gutter'),
								_1: {ctor: '[]'}
							},
							(_elm_lang$core$Native_Utils.cmp(len, 0) < 0) ? {
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									_elm_lang$core$Basics$toString(len + idx2)),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('invisible'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('-'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							} : {
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									_elm_lang$core$Basics$toString(len - idx2)),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Render$leftTermDiv(step.term),
							_1: {ctor: '[]'}
						}
					});
			});
		var _p44 = model.direction;
		if (_p44.ctor === 'History') {
			return A2(
				_elm_lang$html$Html$ol,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$id('scrolling'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$li,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'history-item',
									_elm_lang$core$Native_Utils.eq(
										model.historyIndex,
										_elm_lang$core$List$length(problem.history)) ? ' selected' : '')),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(
									_ezacharias$sftm$Page_Solve$HistoryItemMsg(
										_elm_lang$core$List$length(problem.history))),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('history-gutter'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Start'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _ezacharias$sftm$Render$leftTermDiv(problem.start),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: _elm_lang$core$List$reverse(
						A2(
							_elm_lang$core$List$indexedMap,
							A2(
								f,
								_elm_lang$core$List$length(problem.history),
								model.historyIndex),
							problem.history))
				});
		} else {
			return A2(
				_elm_lang$html$Html$ol,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$id('scrolling'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
							_1: {ctor: '[]'}
						}
					}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$indexedMap,
						A2(
							f,
							_elm_lang$core$Basics$negate(
								_elm_lang$core$List$length(problem.future)),
							model.futureIndex),
						problem.future),
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$li,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'history-item',
										_ezacharias$sftm$Page_Solve$selectedClass(
											_elm_lang$core$Native_Utils.eq(
												model.futureIndex,
												_elm_lang$core$List$length(problem.future))))),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										_ezacharias$sftm$Page_Solve$HistoryItemMsg(
											_elm_lang$core$List$length(problem.future))),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('history-gutter'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('End'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _ezacharias$sftm$Render$leftTermDiv(problem.finish),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}));
		}
	});
var _ezacharias$sftm$Page_Solve$TransformationRedoMsg = {ctor: 'TransformationRedoMsg'};
var _ezacharias$sftm$Page_Solve$TransformationUndoMsg = {ctor: 'TransformationUndoMsg'};
var _ezacharias$sftm$Page_Solve$TransformationDialogMsg = function (a) {
	return {ctor: 'TransformationDialogMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$TransformationUseMsg = {ctor: 'TransformationUseMsg'};
var _ezacharias$sftm$Page_Solve$TransformationItemMsg = function (a) {
	return {ctor: 'TransformationItemMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$viewTransformationsPanel = F2(
	function (problem, model) {
		var f = F2(
			function (idx, sub) {
				var rule = A2(_ezacharias$sftm$Utilities$unsafeGet, sub.ruleIndex, problem.rules);
				return A2(
					_elm_lang$html$Html$li,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'rule-item',
								_ezacharias$sftm$Page_Solve$selectedClass(
									_elm_lang$core$Native_Utils.eq(
										model.transformationSelection,
										_elm_lang$core$Maybe$Just(idx))))),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(
								_ezacharias$sftm$Page_Solve$TransformationItemMsg(idx)),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('rule-name'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(rule.name),
								_1: {
									ctor: '::',
									_0: sub.isReversed ? A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('flipped'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('reversed'),
											_1: {ctor: '[]'}
										}) : _elm_lang$html$Html$text(''),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Render$leftRuleDiv(
								A2(_ezacharias$sftm$Rule$reverseIf, sub.isReversed, rule)),
							_1: {ctor: '[]'}
						}
					});
			});
		return A2(
			_elm_lang$html$Html$ul,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('scrolling'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(_elm_lang$core$List$indexedMap, f, model.transformations));
	});
var _ezacharias$sftm$Page_Solve$ScratchDialogMsg = function (a) {
	return {ctor: 'ScratchDialogMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$ScratchRemoveMsg = {ctor: 'ScratchRemoveMsg'};
var _ezacharias$sftm$Page_Solve$ScratchAddMsg = {ctor: 'ScratchAddMsg'};
var _ezacharias$sftm$Page_Solve$viewTitleButtons = F2(
	function (problem, model) {
		var _p45 = model.panel;
		switch (_p45.ctor) {
			case 'ScratchPanel':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-button'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ScratchAddMsg),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Add'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
			case 'TransformationsPanel':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-button'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$disabled(
									!A2(_ezacharias$sftm$Page_Solve$canUndo, problem, model)),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$TransformationUndoMsg),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Undo'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-button'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$disabled(
										!A2(_ezacharias$sftm$Page_Solve$canRedo, problem, model)),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$TransformationRedoMsg),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Redo'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				};
			default:
				return {ctor: '[]'};
		}
	});
var _ezacharias$sftm$Page_Solve$ScratchItemMsg = function (a) {
	return {ctor: 'ScratchItemMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$viewScratchPanel = F2(
	function (problem, model) {
		var f = F2(
			function (idx, term) {
				return A2(
					_elm_lang$html$Html$li,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'term-item',
								_ezacharias$sftm$Page_Solve$selectedClass(
									_elm_lang$core$Native_Utils.eq(
										model.scratchSelection,
										_elm_lang$core$Maybe$Just(idx))))),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('term-item-formula'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										_ezacharias$sftm$Page_Solve$ScratchItemMsg(idx)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _ezacharias$sftm$Render$leftTermDiv(term),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Native_Utils.eq(
								model.scratchSelection,
								_elm_lang$core$Maybe$Just(idx)) ? A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('scratch-remove-button'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$title('Delete'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ScratchRemoveMsg),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _ezacharias$sftm$Graphics$delete,
									_1: {ctor: '[]'}
								}) : _elm_lang$html$Html$text(''),
							_1: {ctor: '[]'}
						}
					});
			});
		return A2(
			_elm_lang$html$Html$ol,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('scrolling'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(_elm_lang$core$List$indexedMap, f, problem.scratch));
	});
var _ezacharias$sftm$Page_Solve$ContextItemMsg = function (a) {
	return {ctor: 'ContextItemMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$viewContextPanel = F2(
	function (problem, model) {
		var f = F2(
			function (idx, x) {
				return A2(
					_elm_lang$html$Html$li,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'term-item',
								_ezacharias$sftm$Page_Solve$selectedClass(
									_elm_lang$core$Native_Utils.eq(
										model.contextSelection,
										_elm_lang$core$Maybe$Just(idx))))),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(
								_ezacharias$sftm$Page_Solve$ContextItemMsg(idx)),
							_1: {ctor: '[]'}
						}
					},
					_elm_lang$core$List$singleton(
						(_elm_lang$core$Native_Utils.eq(
							model.contextSelection,
							_elm_lang$core$Maybe$Just(idx)) ? _ezacharias$sftm$Render$yellowLeftTermDiv : _ezacharias$sftm$Render$leftTermDiv)(x.term)));
			});
		return A2(
			_elm_lang$html$Html$ol,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('scrolling'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('landscape-hide bottom-list'),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(_elm_lang$core$List$indexedMap, f, model.context));
	});
var _ezacharias$sftm$Page_Solve$viewPanelBody = F2(
	function (problem, model) {
		var _p46 = model.panel;
		switch (_p46.ctor) {
			case 'NotesPanel':
				return A2(_ezacharias$sftm$Page_Solve$viewNotesPanel, problem, model);
			case 'ContextPanel':
				return A2(_ezacharias$sftm$Page_Solve$viewContextPanel, problem, model);
			case 'ScratchPanel':
				return A2(_ezacharias$sftm$Page_Solve$viewScratchPanel, problem, model);
			case 'TransformationsPanel':
				return A2(_ezacharias$sftm$Page_Solve$viewTransformationsPanel, problem, model);
			case 'HistoryPanel':
				return A2(_ezacharias$sftm$Page_Solve$viewHistoryPanel, problem, model);
			default:
				return A2(_ezacharias$sftm$Page_Solve$viewRulesPanel, problem, model);
		}
	});
var _ezacharias$sftm$Page_Solve$ResetPopUpResetMsg = {ctor: 'ResetPopUpResetMsg'};
var _ezacharias$sftm$Page_Solve$ResetPopUpCancelMsg = {ctor: 'ResetPopUpCancelMsg'};
var _ezacharias$sftm$Page_Solve$resetPop = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('popup reset-popup'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('reset-popup-text'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Are you sure you want to reset this problem?'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('reset-popup-buttons'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-button'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ResetPopUpCancelMsg),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Cancel'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-button'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ResetPopUpResetMsg),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Reset'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Page_Solve$copyPop = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('popup copy-popup'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('copy-popup-text'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Copied to clipboard.'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('copy-popup-buttons'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$button,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-button'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ResetPopUpCancelMsg),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('OK'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Page_Solve$SettingsResetMsg = {ctor: 'SettingsResetMsg'};
var _ezacharias$sftm$Page_Solve$SettingsShowProofMsg = {ctor: 'SettingsShowProofMsg'};
var _ezacharias$sftm$Page_Solve$SettingsCopyMsg = {ctor: 'SettingsCopyMsg'};
var _ezacharias$sftm$Page_Solve$settingsPop = F2(
	function (problem, model) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('popup settings-popup'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$ul,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$li,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$SettingsCopyMsg),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Copy focus as TeX'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$li,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$disabled(
													_ezacharias$sftm$Utilities$isNothing(problem.proof)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$SettingsShowProofMsg),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Show proof…'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$li,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$SettingsResetMsg),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Reset problem'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _ezacharias$sftm$Page_Solve$SettingsBackgroundMsg = {ctor: 'SettingsBackgroundMsg'};
var _ezacharias$sftm$Page_Solve$ShowSettingsMsg = {ctor: 'ShowSettingsMsg'};
var _ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg = function (a) {
	return {ctor: 'PanelSelectChoiceMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$PanelSelectBackgroundMsg = {ctor: 'PanelSelectBackgroundMsg'};
var _ezacharias$sftm$Page_Solve$ShowPanelSelectMsg = {ctor: 'ShowPanelSelectMsg'};
var _ezacharias$sftm$Page_Solve$ChangeDirectionMsg = {ctor: 'ChangeDirectionMsg'};
var _ezacharias$sftm$Page_Solve$FocusRightMsg = {ctor: 'FocusRightMsg'};
var _ezacharias$sftm$Page_Solve$FocusOutMsg = {ctor: 'FocusOutMsg'};
var _ezacharias$sftm$Page_Solve$FocusLeftMsg = {ctor: 'FocusLeftMsg'};
var _ezacharias$sftm$Page_Solve$viewNavigationButtons = function (model) {
	return _ezacharias$sftm$Utilities$isNothing(model.transformationSelection) ? {
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('time-arrow-size'),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('fab'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$title('In Left'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$FocusLeftMsg),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$disabled(
									!_ezacharias$sftm$Page_Solve$canFocusLeft(model)),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{
					ctor: '::',
					_0: _ezacharias$sftm$Graphics$circle(
						_ezacharias$sftm$Page_Solve$focusColor(
							_ezacharias$sftm$Page_Solve$canFocusLeft(model))),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('fab'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$title('Out'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$FocusOutMsg),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$disabled(
										!_ezacharias$sftm$Page_Solve$canFocusOut(model)),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _ezacharias$sftm$Graphics$ring(
							_ezacharias$sftm$Page_Solve$focusColor(
								_ezacharias$sftm$Page_Solve$canFocusOut(model))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('fab'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$title('In Right'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$FocusRightMsg),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$disabled(
											!_ezacharias$sftm$Page_Solve$canFocusRight(model)),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: _ezacharias$sftm$Graphics$circle(
								_ezacharias$sftm$Page_Solve$focusColor(
									_ezacharias$sftm$Page_Solve$canFocusRight(model))),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: function () {
							var _p47 = model.direction;
							if (_p47.ctor === 'History') {
								return A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('time-arrow-size'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$title('Direction Forwards'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ChangeDirectionMsg),
												_1: {ctor: '[]'}
											}
										}
									},
									{
										ctor: '::',
										_0: _ezacharias$sftm$Graphics$arrow,
										_1: {ctor: '[]'}
									});
							} else {
								return A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('time-arrow-size'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$title('Direction Backwards'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ChangeDirectionMsg),
												_1: {ctor: '[]'}
											}
										}
									},
									{
										ctor: '::',
										_0: _ezacharias$sftm$Graphics$target,
										_1: {ctor: '[]'}
									});
							}
						}(),
						_1: {ctor: '[]'}
					}
				}
			}
		}
	} : {
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'basic',
						_ezacharias$sftm$Page_Solve$metaClass(
							_ezacharias$sftm$Page_Solve$transformationIsMultiple(model)))),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$TransformationUseMsg),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('Apply'),
				_1: {ctor: '[]'}
			}),
		_1: {ctor: '[]'}
	};
};
var _ezacharias$sftm$Page_Solve$SolvedMsg = {ctor: 'SolvedMsg'};
var _ezacharias$sftm$Page_Solve$BackMsg = {ctor: 'BackMsg'};
var _ezacharias$sftm$Page_Solve$navBar = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('landscape-hide nav-bar'),
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: model.solved ? A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('nav-bar-button'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$title('Q.E.D.'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$SolvedMsg),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _ezacharias$sftm$Graphics$whiteTombstone,
					_1: {ctor: '[]'}
				}) : A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('nav-bar-button'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$title('Back'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$BackMsg),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _ezacharias$sftm$Graphics$leftAngle,
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('top-title'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'Problem ',
								_elm_lang$core$Basics$toString(model.problemIndex + 1))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('nav-bar-button'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$title('Menu'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ShowSettingsMsg),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _ezacharias$sftm$Graphics$dots3,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _ezacharias$sftm$Page_Solve$IgnoreMsg = {ctor: 'IgnoreMsg'};
var _ezacharias$sftm$Page_Solve$scrollingCmd = function (model) {
	var _p48 = model.dialog;
	switch (_p48.ctor) {
		case 'NoDialog':
			var _p49 = model.panel;
			switch (_p49.ctor) {
				case 'NotesPanel':
					return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
				case 'ContextPanel':
					return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
				case 'ScratchPanel':
					return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
				case 'TransformationsPanel':
					return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
				case 'HistoryPanel':
					var _p50 = model.direction;
					if (_p50.ctor === 'History') {
						return _ezacharias$sftm$Utilities$scrollToBottomCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
					} else {
						return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
					}
				default:
					return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
			}
		case 'TransformationDialog':
			return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
		default:
			return _ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg);
	}
};
var _ezacharias$sftm$Page_Solve$ShowProofOutMsg = {ctor: 'ShowProofOutMsg'};
var _ezacharias$sftm$Page_Solve$ExitOutMsg = {ctor: 'ExitOutMsg'};
var _ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg = F2(
	function (a, b) {
		return {ctor: 'ModelCmdChangedOutMsg', _0: a, _1: b};
	});
var _ezacharias$sftm$Page_Solve$SolvedOutMsg = F2(
	function (a, b) {
		return {ctor: 'SolvedOutMsg', _0: a, _1: b};
	});
var _ezacharias$sftm$Page_Solve$ProblemChangedOutMsg = F2(
	function (a, b) {
		return {ctor: 'ProblemChangedOutMsg', _0: a, _1: b};
	});
var _ezacharias$sftm$Page_Solve$ModelChangedOutMsg = function (a) {
	return {ctor: 'ModelChangedOutMsg', _0: a};
};
var _ezacharias$sftm$Page_Solve$UnchangedOutMsg = {ctor: 'UnchangedOutMsg'};
var _ezacharias$sftm$Page_Solve$RulesPanel = {ctor: 'RulesPanel'};
var _ezacharias$sftm$Page_Solve$HistoryPanel = {ctor: 'HistoryPanel'};
var _ezacharias$sftm$Page_Solve$TransformationsPanel = {ctor: 'TransformationsPanel'};
var _ezacharias$sftm$Page_Solve$transformedTerm = function (model) {
	return (_ezacharias$sftm$Utilities$isNothing(model.transformationSelection) || (!_elm_lang$core$Native_Utils.eq(model.panel, _ezacharias$sftm$Page_Solve$TransformationsPanel))) ? model.term : A3(
		_ezacharias$sftm$Page_Solve$termReplace,
		model.path,
		_ezacharias$sftm$Page_Solve$currentTransformation(model).display,
		model.term);
};
var _ezacharias$sftm$Page_Solve$ScratchPanel = {ctor: 'ScratchPanel'};
var _ezacharias$sftm$Page_Solve$ContextPanel = {ctor: 'ContextPanel'};
var _ezacharias$sftm$Page_Solve$NotesPanel = {ctor: 'NotesPanel'};
var _ezacharias$sftm$Page_Solve$pop = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('popup panel-popup'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$ul,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$li,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onClick(
											_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$NotesPanel)),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Notes'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$li,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(
												_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$ContextPanel)),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Context'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$li,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$ScratchPanel)),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Scratch Pad'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$li,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(
														_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$TransformationsPanel)),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Transformations'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$li,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$button,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Events$onClick(
															_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$HistoryPanel)),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: function () {
														var _p51 = model.direction;
														if (_p51.ctor === 'History') {
															return _elm_lang$html$Html$text('History');
														} else {
															return _elm_lang$html$Html$text('Future');
														}
													}(),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$li,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('panel-select-item'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$button,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('panel-select-button'),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onClick(
																_ezacharias$sftm$Page_Solve$PanelSelectChoiceMsg(_ezacharias$sftm$Page_Solve$RulesPanel)),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Rules'),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _ezacharias$sftm$Page_Solve$viewNoDialog = F2(
	function (problem, model) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('content-body'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _ezacharias$sftm$Page_Solve$navBar(model),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('main-formula'),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_ezacharias$sftm$Render$formulaHtml2,
								_ezacharias$sftm$Page_Solve$transformedTerm(model),
								model.path,
								_ezacharias$sftm$Page_Solve$contextSelectionPath(model)),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('navigation'),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
									_1: {ctor: '[]'}
								}
							},
							_ezacharias$sftm$Page_Solve$viewNavigationButtons(model)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-title landscape-hide'),
									_1: {
										ctor: '::',
										_0: _ezacharias$sftm$Page_Solve$modelAriaHidden(model),
										_1: {ctor: '[]'}
									}
								},
								A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('panel-title-button'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$ShowPanelSelectMsg),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$div,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('up-down-arrows'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _ezacharias$sftm$Graphics$upDownArrows,
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$div,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$class('panel-title-text'),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text(
																_ezacharias$sftm$Page_Solve$panelTitle(model)),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									},
									A2(
										_elm_lang$core$Basics_ops['++'],
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('grow'),
													_1: {ctor: '[]'}
												},
												{ctor: '[]'}),
											_1: {ctor: '[]'}
										},
										A2(_ezacharias$sftm$Page_Solve$viewTitleButtons, problem, model)))),
							_1: {
								ctor: '::',
								_0: A2(_ezacharias$sftm$Page_Solve$viewPanelBody, problem, model),
								_1: {
									ctor: '::',
									_0: function () {
										var _p52 = model.popUp;
										if (_p52.ctor === 'NoPopUp') {
											return _elm_lang$html$Html$text('');
										} else {
											return A2(
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('popup-background'),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$title('Close Pop-Up'),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onClick(_ezacharias$sftm$Page_Solve$PanelSelectBackgroundMsg),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'});
										}
									}(),
									_1: {
										ctor: '::',
										_0: function () {
											var _p53 = model.popUp;
											switch (_p53.ctor) {
												case 'NoPopUp':
													return _elm_lang$html$Html$text('');
												case 'PanelSelectPopUp':
													return _ezacharias$sftm$Page_Solve$pop(model);
												case 'SettingsPopUp':
													return A2(_ezacharias$sftm$Page_Solve$settingsPop, problem, model);
												case 'ResetPopUp':
													return _ezacharias$sftm$Page_Solve$resetPop(model);
												default:
													return _ezacharias$sftm$Page_Solve$copyPop(model);
											}
										}(),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			});
	});
var _ezacharias$sftm$Page_Solve$view = F2(
	function (problem, model) {
		var _p54 = model.dialog;
		switch (_p54.ctor) {
			case 'NoDialog':
				return A2(_ezacharias$sftm$Page_Solve$viewNoDialog, problem, model);
			case 'TransformationDialog':
				return A2(
					_elm_lang$html$Html$map,
					_ezacharias$sftm$Page_Solve$TransformationDialogMsg,
					_ezacharias$sftm$Dialog_Transformation$view(_p54._0));
			default:
				return A2(
					_elm_lang$html$Html$map,
					_ezacharias$sftm$Page_Solve$ScratchDialogMsg,
					_ezacharias$sftm$Dialog_Scratch$view(_p54._0));
		}
	});
var _ezacharias$sftm$Page_Solve$ScratchDialog = function (a) {
	return {ctor: 'ScratchDialog', _0: a};
};
var _ezacharias$sftm$Page_Solve$TransformationDialog = function (a) {
	return {ctor: 'TransformationDialog', _0: a};
};
var _ezacharias$sftm$Page_Solve$NoDialog = {ctor: 'NoDialog'};
var _ezacharias$sftm$Page_Solve$Future = {ctor: 'Future'};
var _ezacharias$sftm$Page_Solve$History = {ctor: 'History'};
var _ezacharias$sftm$Page_Solve$reallyInit = function (idx) {
	return {
		problemIndex: idx,
		direction: _ezacharias$sftm$Page_Solve$History,
		historyIndex: 0,
		futureIndex: 0,
		historyPath: {ctor: '[]'},
		futurePath: {ctor: '[]'},
		dialog: _ezacharias$sftm$Page_Solve$NoDialog,
		panel: _ezacharias$sftm$Page_Solve$NotesPanel,
		popUp: _ezacharias$sftm$Page_Solve$NoPopUp,
		contextSelection: _elm_lang$core$Maybe$Nothing,
		scratchSelection: _elm_lang$core$Maybe$Nothing,
		transformationSelection: _elm_lang$core$Maybe$Nothing,
		term: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
		focus: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
		context: {ctor: '[]'},
		path: {ctor: '[]'},
		transformations: {ctor: '[]'},
		solved: false
	};
};
var _ezacharias$sftm$Page_Solve$flipDirection = function (d) {
	var _p55 = d;
	if (_p55.ctor === 'History') {
		return _ezacharias$sftm$Page_Solve$Future;
	} else {
		return _ezacharias$sftm$Page_Solve$History;
	}
};
var _ezacharias$sftm$Page_Solve$refocus = F3(
	function (path, problem, model) {
		var solved = _elm_lang$core$Native_Utils.eq(
			A3(_ezacharias$sftm$Page_Solve$currentTerm, _ezacharias$sftm$Page_Solve$History, problem, model),
			A3(_ezacharias$sftm$Page_Solve$currentTerm, _ezacharias$sftm$Page_Solve$Future, problem, model));
		var term = A3(_ezacharias$sftm$Page_Solve$currentTerm, model.direction, problem, model);
		var focus = A2(_ezacharias$sftm$Page_Solve$termFocus, path, term);
		var context = _elm_lang$core$List$reverse(
			A4(
				_ezacharias$sftm$Page_Solve$pushNestedContext,
				path,
				term,
				{ctor: '[]'},
				{ctor: '[]'}));
		var transformations = A4(
			_ezacharias$sftm$Transformations$transformations,
			problem.rules,
			problem.scratch,
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.term;
				},
				context),
			focus);
		var _p56 = function () {
			var _p57 = model.direction;
			if (_p57.ctor === 'History') {
				return {ctor: '_Tuple2', _0: path, _1: model.futurePath};
			} else {
				return {ctor: '_Tuple2', _0: model.historyPath, _1: path};
			}
		}();
		var historyPath = _p56._0;
		var futurePath = _p56._1;
		return _elm_lang$core$Native_Utils.update(
			model,
			{historyPath: historyPath, futurePath: futurePath, term: term, focus: focus, context: context, path: path, transformations: transformations, solved: solved, scratchSelection: _elm_lang$core$Maybe$Nothing, contextSelection: _elm_lang$core$Maybe$Nothing, transformationSelection: _elm_lang$core$Maybe$Nothing});
	});
var _ezacharias$sftm$Page_Solve$init = F2(
	function (idx, problem) {
		return A3(
			_ezacharias$sftm$Page_Solve$refocus,
			{ctor: '[]'},
			problem,
			_ezacharias$sftm$Page_Solve$reallyInit(idx));
	});
var _ezacharias$sftm$Page_Solve$update = F3(
	function (problem, msg, model) {
		var _p58 = msg;
		switch (_p58.ctor) {
			case 'IgnoreMsg':
				return _ezacharias$sftm$Page_Solve$UnchangedOutMsg;
			case 'BackMsg':
				return _ezacharias$sftm$Page_Solve$ExitOutMsg;
			case 'SolvedMsg':
				return A2(
					_ezacharias$sftm$Page_Solve$SolvedOutMsg,
					A2(_ezacharias$sftm$Page_Solve$proofSteps, problem, model),
					_elm_lang$core$Native_Utils.update(
						problem,
						{solved: true}));
			case 'FocusLeftMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					A3(
						_ezacharias$sftm$Page_Solve$refocus,
						_ezacharias$sftm$Path$left(model.path),
						problem,
						model));
			case 'FocusOutMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					A3(
						_ezacharias$sftm$Page_Solve$refocus,
						_ezacharias$sftm$Path$out(model.path),
						problem,
						model));
			case 'FocusRightMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					A3(
						_ezacharias$sftm$Page_Solve$refocus,
						_ezacharias$sftm$Path$right(model.path),
						problem,
						model));
			case 'ShowPanelSelectMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$PanelSelectPopUp}));
			case 'PanelSelectBackgroundMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$NoPopUp}));
			case 'PanelSelectChoiceMsg':
				var _p59 = _p58._0;
				if (_elm_lang$core$Native_Utils.eq(_p59, model.panel)) {
					return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						_elm_lang$core$Native_Utils.update(
							model,
							{popUp: _ezacharias$sftm$Page_Solve$NoPopUp}));
				} else {
					var newModel = A3(
						_ezacharias$sftm$Page_Solve$refocus,
						model.path,
						problem,
						_elm_lang$core$Native_Utils.update(
							model,
							{panel: _p59, popUp: _ezacharias$sftm$Page_Solve$NoPopUp}));
					return A2(
						_ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg,
						newModel,
						_ezacharias$sftm$Page_Solve$scrollingCmd(newModel));
				}
			case 'ShowSettingsMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$SettingsPopUp}));
			case 'SettingsBackgroundMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$NoPopUp}));
			case 'SettingsCopyMsg':
				return A2(
					_ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg,
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$CopyPopUp}),
					_ezacharias$sftm$Ports$copy(
						_ezacharias$sftm$Term$tex(
							_ezacharias$sftm$Page_Solve$transformedTerm(model))));
			case 'SettingsResetMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$ResetPopUp}));
			case 'ResetPopUpCancelMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{popUp: _ezacharias$sftm$Page_Solve$NoPopUp}));
			case 'ResetPopUpResetMsg':
				var newProblem = _ezacharias$sftm$Problem$reset(problem);
				var newModel = A2(_ezacharias$sftm$Page_Solve$init, model.problemIndex, newProblem);
				return A2(_ezacharias$sftm$Page_Solve$ProblemChangedOutMsg, newProblem, newModel);
			case 'ScratchAddMsg':
				return A2(
					_ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg,
					_elm_lang$core$Native_Utils.update(
						model,
						{
							dialog: _ezacharias$sftm$Page_Solve$ScratchDialog(
								A3(_ezacharias$sftm$Dialog_Scratch$init, problem.scratchSymbols, problem.scratch, model.focus))
						}),
					_ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg));
			case 'ScratchRemoveMsg':
				var newProblem = _elm_lang$core$Native_Utils.update(
					problem,
					{
						scratch: A2(
							_ezacharias$sftm$Utilities$remove,
							_ezacharias$sftm$Utilities$fromJust(model.scratchSelection),
							problem.scratch)
					});
				return A2(
					_ezacharias$sftm$Page_Solve$ProblemChangedOutMsg,
					newProblem,
					A3(_ezacharias$sftm$Page_Solve$refocus, model.path, newProblem, model));
			case 'ScratchDialogMsg':
				var _p60 = model.dialog;
				if (_p60.ctor === 'ScratchDialog') {
					var _p61 = A2(_ezacharias$sftm$Dialog_Scratch$update, _p58._0, _p60._0);
					switch (_p61.ctor) {
						case 'NoChangeOut':
							return _ezacharias$sftm$Page_Solve$UnchangedOutMsg;
						case 'ChangedOut':
							return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
								_elm_lang$core$Native_Utils.update(
									model,
									{
										dialog: _ezacharias$sftm$Page_Solve$ScratchDialog(_p61._0)
									}));
						case 'ChangedCmdOut':
							return A2(
								_ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg,
								_elm_lang$core$Native_Utils.update(
									model,
									{
										dialog: _ezacharias$sftm$Page_Solve$ScratchDialog(_p61._0)
									}),
								A2(_elm_lang$core$Platform_Cmd$map, _ezacharias$sftm$Page_Solve$ScratchDialogMsg, _p61._1));
						case 'ExitOut':
							return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
								_elm_lang$core$Native_Utils.update(
									model,
									{dialog: _ezacharias$sftm$Page_Solve$NoDialog}));
						default:
							var _p62 = _p61._0;
							var newModel = _elm_lang$core$Native_Utils.update(
								model,
								{dialog: _ezacharias$sftm$Page_Solve$NoDialog});
							var newProblem = _elm_lang$core$Native_Utils.update(
								problem,
								{
									scratch: A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$List$filter,
											function (t) {
												return !_elm_lang$core$Native_Utils.eq(t, _p62);
											},
											problem.scratch),
										{
											ctor: '::',
											_0: _p62,
											_1: {ctor: '[]'}
										})
								});
							return A2(
								_ezacharias$sftm$Page_Solve$ProblemChangedOutMsg,
								newProblem,
								A3(_ezacharias$sftm$Page_Solve$refocus, model.path, newProblem, newModel));
					}
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Page.Solve',
						{
							start: {line: 704, column: 13},
							end: {line: 735, column: 45}
						},
						_p60)('impossible');
				}
			case 'TransformationDialogMsg':
				var _p64 = model.dialog;
				if (_p64.ctor === 'TransformationDialog') {
					var _p65 = A2(_ezacharias$sftm$Dialog_Transformation$update, _p58._0, _p64._0);
					switch (_p65.ctor) {
						case 'EmptyOut':
							return _ezacharias$sftm$Page_Solve$UnchangedOutMsg;
						case 'ChangedOut':
							return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
								_elm_lang$core$Native_Utils.update(
									model,
									{
										dialog: _ezacharias$sftm$Page_Solve$TransformationDialog(_p65._0)
									}));
						case 'CancelOut':
							return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
								_elm_lang$core$Native_Utils.update(
									model,
									{dialog: _ezacharias$sftm$Page_Solve$NoDialog, transformationSelection: _elm_lang$core$Maybe$Nothing}));
						default:
							var _p68 = _p65._0;
							var newModel1 = function () {
								var _p66 = model.direction;
								if (_p66.ctor === 'History') {
									return _elm_lang$core$Native_Utils.update(
										model,
										{historyIndex: 0});
								} else {
									return _elm_lang$core$Native_Utils.update(
										model,
										{futureIndex: 0});
								}
							}();
							var term = A3(_ezacharias$sftm$Page_Solve$termReplace, model.path, _p65._1, model.term);
							var newProblem = function () {
								var _p67 = model.direction;
								if (_p67.ctor === 'History') {
									return _elm_lang$core$Native_Utils.update(
										problem,
										{
											history: {
												ctor: '::',
												_0: {term: term, rule: _p68.ruleIndex, isReversed: _p68.isReversed},
												_1: A2(_elm_lang$core$List$drop, model.historyIndex, problem.history)
											}
										});
								} else {
									return _elm_lang$core$Native_Utils.update(
										problem,
										{
											future: {
												ctor: '::',
												_0: {term: term, rule: _p68.ruleIndex, isReversed: _p68.isReversed},
												_1: A2(_elm_lang$core$List$drop, model.futureIndex, problem.future)
											}
										});
								}
							}();
							var newModel2 = A3(
								_ezacharias$sftm$Page_Solve$refocus,
								model.path,
								newProblem,
								_elm_lang$core$Native_Utils.update(
									newModel1,
									{dialog: _ezacharias$sftm$Page_Solve$NoDialog}));
							return A2(_ezacharias$sftm$Page_Solve$ProblemChangedOutMsg, newProblem, newModel2);
					}
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Page.Solve',
						{
							start: {line: 738, column: 13},
							end: {line: 791, column: 45}
						},
						_p64)('impossible');
				}
			case 'ScratchItemMsg':
				var _p70 = _p58._0;
				return _elm_lang$core$Native_Utils.eq(
					model.scratchSelection,
					_elm_lang$core$Maybe$Just(_p70)) ? _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{scratchSelection: _elm_lang$core$Maybe$Nothing})) : _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							scratchSelection: _elm_lang$core$Maybe$Just(_p70)
						}));
			case 'ContextItemMsg':
				var _p71 = _p58._0;
				return _elm_lang$core$Native_Utils.eq(
					model.contextSelection,
					_elm_lang$core$Maybe$Just(_p71)) ? _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{contextSelection: _elm_lang$core$Maybe$Nothing})) : _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							contextSelection: _elm_lang$core$Maybe$Just(_p71)
						}));
			case 'TransformationItemMsg':
				var _p72 = _p58._0;
				return _elm_lang$core$Native_Utils.eq(
					model.transformationSelection,
					_elm_lang$core$Maybe$Just(_p72)) ? _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{transformationSelection: _elm_lang$core$Maybe$Nothing})) : _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							transformationSelection: _elm_lang$core$Maybe$Just(_p72)
						}));
			case 'TransformationUseMsg':
				var sub = _ezacharias$sftm$Page_Solve$currentTransformation(model);
				var rule = A2(_ezacharias$sftm$Utilities$unsafeGet, sub.ruleIndex, problem.rules);
				if (sub.isMultiple) {
					return A2(
						_ezacharias$sftm$Page_Solve$ModelCmdChangedOutMsg,
						_elm_lang$core$Native_Utils.update(
							model,
							{
								dialog: _ezacharias$sftm$Page_Solve$TransformationDialog(
									A5(
										_ezacharias$sftm$Dialog_Transformation$init,
										model.focus,
										A2(
											_elm_lang$core$List$map,
											function (_) {
												return _.term;
											},
											model.context),
										problem.scratch,
										A2(_ezacharias$sftm$Rule$reverseIf, sub.isReversed, rule),
										sub))
							}),
						_ezacharias$sftm$Utilities$scrollToTopCmd(_ezacharias$sftm$Page_Solve$IgnoreMsg));
				} else {
					var newModel1 = function () {
						var _p73 = model.direction;
						if (_p73.ctor === 'History') {
							return _elm_lang$core$Native_Utils.update(
								model,
								{historyIndex: 0});
						} else {
							return _elm_lang$core$Native_Utils.update(
								model,
								{futureIndex: 0});
						}
					}();
					var term = A3(_ezacharias$sftm$Page_Solve$termReplace, model.path, sub.display, model.term);
					var newProblem = function () {
						var _p74 = model.direction;
						if (_p74.ctor === 'History') {
							return _elm_lang$core$Native_Utils.update(
								problem,
								{
									history: {
										ctor: '::',
										_0: {term: term, rule: sub.ruleIndex, isReversed: sub.isReversed},
										_1: A2(_elm_lang$core$List$drop, model.historyIndex, problem.history)
									}
								});
						} else {
							return _elm_lang$core$Native_Utils.update(
								problem,
								{
									future: {
										ctor: '::',
										_0: {term: term, rule: sub.ruleIndex, isReversed: sub.isReversed},
										_1: A2(_elm_lang$core$List$drop, model.futureIndex, problem.future)
									}
								});
						}
					}();
					var newModel2 = A3(_ezacharias$sftm$Page_Solve$refocus, model.path, newProblem, newModel1);
					return A2(_ezacharias$sftm$Page_Solve$ProblemChangedOutMsg, newProblem, newModel2);
				}
			case 'ChangeDirectionMsg':
				return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
					A3(
						_ezacharias$sftm$Page_Solve$refocus,
						_ezacharias$sftm$Page_Solve$flippedPath(model),
						problem,
						_elm_lang$core$Native_Utils.update(
							model,
							{
								direction: _ezacharias$sftm$Page_Solve$flipDirection(model.direction),
								transformationSelection: _elm_lang$core$Maybe$Nothing,
								contextSelection: _elm_lang$core$Maybe$Nothing
							})));
			case 'HistoryItemMsg':
				var _p76 = _p58._0;
				var _p75 = model.direction;
				if (_p75.ctor === 'History') {
					return _elm_lang$core$Native_Utils.eq(_p76, model.historyIndex) ? _ezacharias$sftm$Page_Solve$UnchangedOutMsg : _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{historyIndex: _p76})));
				} else {
					return _elm_lang$core$Native_Utils.eq(_p76, model.futureIndex) ? _ezacharias$sftm$Page_Solve$UnchangedOutMsg : _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{futureIndex: _p76})));
				}
			case 'SettingsShowProofMsg':
				return _ezacharias$sftm$Page_Solve$ShowProofOutMsg;
			case 'TransformationUndoMsg':
				var _p77 = model.direction;
				if (_p77.ctor === 'History') {
					return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{historyIndex: model.historyIndex + 1})));
				} else {
					return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{futureIndex: model.futureIndex + 1})));
				}
			default:
				var _p78 = model.direction;
				if (_p78.ctor === 'History') {
					return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{historyIndex: model.historyIndex - 1})));
				} else {
					return _ezacharias$sftm$Page_Solve$ModelChangedOutMsg(
						A3(
							_ezacharias$sftm$Page_Solve$refocus,
							{ctor: '[]'},
							problem,
							_elm_lang$core$Native_Utils.update(
								model,
								{futureIndex: model.futureIndex - 1})));
				}
		}
	});

var _ezacharias$sftm$Rules$implicationFromEquivalenceRule = {
	name: 'Implication in terms of equivalence',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Implication,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))))
};
var _ezacharias$sftm$Rules$negationFromEquivalenceRule = {
	name: 'Negation in terms of equivalence',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A2(
		_ezacharias$sftm$Term$Unary,
		_ezacharias$sftm$Term$Not,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot))
};
var _ezacharias$sftm$Rules$reflexivityForEquivalenceRule = {
	name: 'Reflexivity',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
	right: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)
};
var _ezacharias$sftm$Rules$substitutionRule = {
	name: 'Substitution',
	isSymmetric: false,
	antecedents: {
		ctor: '::',
		_0: A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Equivalence,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
		_1: {ctor: '[]'}
	},
	left: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
	right: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))
};
var _ezacharias$sftm$Rules$associativityForDisjunctionRule = {
	name: 'Associativity for disjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Disjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Disjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))
};
var _ezacharias$sftm$Rules$associativityForConjunctionRule = {
	name: 'Associativity for conjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))
};
var _ezacharias$sftm$Rules$symmetryForEquivalenceRule = {
	name: 'Symmetry for equivalence',
	isSymmetric: true,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)))
};
var _ezacharias$sftm$Rules$commutativityForDisjunctionRule = {
	name: 'Commutativity for disjunction',
	isSymmetric: true,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)))
};
var _ezacharias$sftm$Rules$commutativityForConjunctionRule = {
	name: 'Commutativity for conjunction',
	isSymmetric: true,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)))
};
var _ezacharias$sftm$Rules$annihilationForEquivalenceRule = {
	name: 'Annihilation for equivalence (bad)',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
	right: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot)
};
var _ezacharias$sftm$Rules$annihilationForDisjunctionRule = {
	name: 'Annihilation for disjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
	right: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)
};
var _ezacharias$sftm$Rules$annihilationForConjunctionRule = {
	name: 'Annihilation for conjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))),
	right: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot)
};
var _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction = {
	name: 'Distribution of disjunction over conjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Disjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Disjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC))))
};
var _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction = {
	name: 'Distribution of conjunction over disjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Disjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC)))),
	right: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaB))),
		A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
			_ezacharias$sftm$Term$Atom(
				_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaC))))
};
var _ezacharias$sftm$Rules$identityForEquivalenceRule = {
	name: 'Identity for equivalence',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Equivalence,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
	right: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))
};
var _ezacharias$sftm$Rules$identityForDisjunctionRule = {
	name: 'Identity for disjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Disjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot)),
	right: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))
};
var _ezacharias$sftm$Rules$identityForConjunctionRule = {
	name: 'Identity for conjunction',
	isSymmetric: false,
	antecedents: {ctor: '[]'},
	left: A3(
		_ezacharias$sftm$Term$Binary,
		_ezacharias$sftm$Term$Conjunction,
		_ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
	right: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))
};
var _ezacharias$sftm$Rules$explosionRule = {
	name: 'Explosion',
	isSymmetric: false,
	antecedents: {
		ctor: '::',
		_0: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
		_1: {ctor: '[]'}
	},
	left: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
	right: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA))
};
var _ezacharias$sftm$Rules$implosionRule = {
	name: 'Implosion',
	isSymmetric: false,
	antecedents: {
		ctor: '::',
		_0: _ezacharias$sftm$Term$Atom(
			_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
		_1: {ctor: '[]'}
	},
	left: _ezacharias$sftm$Term$Atom(
		_ezacharias$sftm$Term$MetaVar(_ezacharias$sftm$Term$MetaA)),
	right: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)
};

var _ezacharias$sftm$Problems$symbols4 = {
	ctor: '::',
	_0: _ezacharias$sftm$Symbol$Top,
	_1: {
		ctor: '::',
		_0: _ezacharias$sftm$Symbol$Bot,
		_1: {
			ctor: '::',
			_0: _ezacharias$sftm$Symbol$Conjunction,
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Symbol$Disjunction,
				_1: {
					ctor: '::',
					_0: _ezacharias$sftm$Symbol$Equivalence,
					_1: {ctor: '[]'}
				}
			}
		}
	}
};
var _ezacharias$sftm$Problems$symbols3 = {
	ctor: '::',
	_0: _ezacharias$sftm$Symbol$Top,
	_1: {
		ctor: '::',
		_0: _ezacharias$sftm$Symbol$Bot,
		_1: {
			ctor: '::',
			_0: _ezacharias$sftm$Symbol$Conjunction,
			_1: {
				ctor: '::',
				_0: _ezacharias$sftm$Symbol$Disjunction,
				_1: {ctor: '[]'}
			}
		}
	}
};
var _ezacharias$sftm$Problems$symbols2 = {
	ctor: '::',
	_0: _ezacharias$sftm$Symbol$Top,
	_1: {
		ctor: '::',
		_0: _ezacharias$sftm$Symbol$Bot,
		_1: {
			ctor: '::',
			_0: _ezacharias$sftm$Symbol$Conjunction,
			_1: {ctor: '[]'}
		}
	}
};
var _ezacharias$sftm$Problems$symbols1 = {
	ctor: '::',
	_0: _ezacharias$sftm$Symbol$Top,
	_1: {
		ctor: '::',
		_0: _ezacharias$sftm$Symbol$Conjunction,
		_1: {ctor: '[]'}
	}
};
var _ezacharias$sftm$Problems$problems = {
	ctor: '::',
	_0: {
		description: 'Use identity for conjunction.',
		notes: {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Your task is to transform the '),
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Render$latinUpperAHtml,
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text(' at the top of the screen into '),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Render$termSpan(
									A3(
										_ezacharias$sftm$Term$Binary,
										_ezacharias$sftm$Term$Conjunction,
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top))),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text('.'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Click the word Notes and then click Transformations. There is only one possible transformation. Click it and then click Apply.'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('A '),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Graphics$lowerWhiteTombstone,
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text(' shape should appear at the top-left of the screen to show you’ve solved the problem. Click it to go on to the next one.'),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('If something goes wrong you can use the undo and redo buttons in the transformations panel. You can also completely reset the problem from the menu at the top-right of the screen.'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		},
		start: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
		finish: A3(
			_ezacharias$sftm$Term$Binary,
			_ezacharias$sftm$Term$Conjunction,
			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
		rules: {
			ctor: '::',
			_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
			_1: {ctor: '[]'}
		},
		scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
	},
	_1: {
		ctor: '::',
		_0: {
			description: 'Use identity for conjunction in the other direction.',
			notes: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('This problem is the reverse of the previous one. The initial formula is '),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Render$termSpan(
								A3(
									_ezacharias$sftm$Term$Binary,
									_ezacharias$sftm$Term$Conjunction,
									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top))),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(' and the goal is '),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Render$latinUpperAHtml,
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text('.'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('There are now two possible transformations in the transformation panel. Figure out which one to apply to solve the problem.'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('I’ll explain what some of these symbols mean.'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _ezacharias$sftm$Render$latinUpperAHtml,
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text(' is a '),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$em,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('variable'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text('. Rather than standing for a number as in algebra, it stands for a logical value such as true or false.'),
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('The '),
										_1: {
											ctor: '::',
											_0: _ezacharias$sftm$Render$conjunctionHtml,
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text(' symbol is called '),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$em,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('conjunction'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text(' or '),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$em,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('logical-and'),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html$text('. For a conjunction to be true, the expressions on both the left and the right must be true. If either the left or right is false, the conjunction is false.'),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$p,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _ezacharias$sftm$Render$topHtml,
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text(' is the symbol '),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$em,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('true'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text('.'),
														_1: {ctor: '[]'}
													}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('The initial formula can be read out loud as, “A and true”.'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$p,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('The behavior of these symbols is defined by rules shown in the rules panel. Later I will describe how to read rules.'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			},
			start: A3(
				_ezacharias$sftm$Term$Binary,
				_ezacharias$sftm$Term$Conjunction,
				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
			finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
			rules: {
				ctor: '::',
				_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
				_1: {ctor: '[]'}
			},
			scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
		},
		_1: {
			ctor: '::',
			_0: {
				description: 'Use identity for conjunction twice.',
				notes: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('To solve this problem, you must apply a transformation twice.'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('See the '),
								_1: {
									ctor: '::',
									_0: _ezacharias$sftm$Graphics$lowerArrow,
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text(' at the right of the screen? Click it and it will show you the goal formula. Click again and it will take you back to the initial formula. You can work from the initial formula towards the goal or from the goal towards the initial formula.'),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				},
				start: A3(
					_ezacharias$sftm$Term$Binary,
					_ezacharias$sftm$Term$Conjunction,
					A3(
						_ezacharias$sftm$Term$Binary,
						_ezacharias$sftm$Term$Conjunction,
						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
				finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
				rules: {
					ctor: '::',
					_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
					_1: {ctor: '[]'}
				},
				scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
			},
			_1: {
				ctor: '::',
				_0: {
					description: 'Use navigation.',
					notes: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('This problem is the same as the previous one except the parentheses have moved. To solve it you need to learn how to navigate.'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('See the dots below the formula? Clicking on them lets you navigate to different parts of the formula. As you navigate, the '),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$em,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('focus'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text(' will change.'),
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Figure out where you need to apply transformations to solve the problem.'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					},
					start: A3(
						_ezacharias$sftm$Term$Binary,
						_ezacharias$sftm$Term$Conjunction,
						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
						A3(
							_ezacharias$sftm$Term$Binary,
							_ezacharias$sftm$Term$Conjunction,
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top))),
					finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
					rules: {
						ctor: '::',
						_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
						_1: {ctor: '[]'}
					},
					scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
				},
				_1: {
					ctor: '::',
					_0: {
						description: 'Use implosion.',
						notes: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('This problem introduces a new rule called implosion. It can be found in the rules panel.'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('In the initial formula, the variable '),
										_1: {
											ctor: '::',
											_0: _ezacharias$sftm$Render$latinUpperAHtml,
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text(' is repeated. You can eliminate this repetition by replacing one of the '),
												_1: {
													ctor: '::',
													_0: _ezacharias$sftm$Render$latinUpperAHtml,
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text('s with '),
														_1: {
															ctor: '::',
															_0: _ezacharias$sftm$Render$topHtml,
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html$text('. In a later problem, you will go on to remove the '),
																_1: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Render$topHtml,
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('.'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$p,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('At any given focus, the expressions which can be replaced by '),
											_1: {
												ctor: '::',
												_0: _ezacharias$sftm$Render$topHtml,
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text(' are called the '),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$em,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('context '),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html$text('. These are shown in the context panel.'),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('There are two rules for what expressions are added to the context. First, if you are on one side of a conjunction, the other side is added. Second, if the expression being added to the context is a conjunction, the left and right sides are individually added instead of the entire conjunction. If either the left or right is itself a conjunction, it is broken up as well, and so on.'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$p,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Navigating around while looking at the context panel should help you get a feel for these rules. Clicking on an expression in the context panel will highlight that expression in the formula.'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						start: A3(
							_ezacharias$sftm$Term$Binary,
							_ezacharias$sftm$Term$Conjunction,
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
						finish: A3(
							_ezacharias$sftm$Term$Binary,
							_ezacharias$sftm$Term$Conjunction,
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
						rules: {
							ctor: '::',
							_0: _ezacharias$sftm$Rules$implosionRule,
							_1: {ctor: '[]'}
						},
						scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
					},
					_1: {
						ctor: '::',
						_0: {
							description: 'Use implosion in the other direction.',
							notes: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('This time you’re going to use the implosion rule to replace '),
										_1: {
											ctor: '::',
											_0: _ezacharias$sftm$Render$topHtml,
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text(' with '),
												_1: {
													ctor: '::',
													_0: _ezacharias$sftm$Render$latinUpperAHtml,
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text('. It’s not called the explosion rule when used this way. There’s another rule called the explosion rule which you will encounter later.'),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$p,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('When you focus on '),
											_1: {
												ctor: '::',
												_0: _ezacharias$sftm$Render$topHtml,
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text(' only  '),
													_1: {
														ctor: '::',
														_0: _ezacharias$sftm$Render$latinUpperAHtml,
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html$text(' is in the context, so '),
															_1: {
																ctor: '::',
																_0: _ezacharias$sftm$Render$latinUpperAHtml,
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html$text(' will automatically be used by the rule. If there is more than one expression in the context, you will be given a choice of which expression to use.'),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Now that you’ve seen a few rules, I’ll explain how to read them. Here’s implosion:'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$p,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('center-text'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _ezacharias$sftm$Render$ruleSpan(_ezacharias$sftm$Rules$implosionRule),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$p,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('The '),
														_1: {
															ctor: '::',
															_0: _ezacharias$sftm$Render$turnstileHtml,
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html$text(' symbol is called the '),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$em,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('turnstile'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('. If there is something to the left of the turnstile, it must be in the context for the rule to match.'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$p,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('The '),
															_1: {
																ctor: '::',
																_0: _ezacharias$sftm$Render$longLeftRightArrowHtml,
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html$text(' symbol means the rule can replace the pattern on the left with the pattern on the right.'),
																	_1: {ctor: '[]'}
																}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$p,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _ezacharias$sftm$Render$frakturAHtml,
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html$text(' (a traditional German letter A) is a '),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$em,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('metavariable'),
																				_1: {ctor: '[]'}
																			}),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('. It can match anything.'),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$p,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('You have already seen '),
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$topHtml,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('. In a rule, '),
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Render$topHtml,
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(' only matches '),
																					_1: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Render$topHtml,
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('.'),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$p,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('The implosion rule can be read out loud as, “if something is in the context, you can replace it with true”.'),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$p,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Rules can match in either direction. Every rule which matches at the current focus is listed in the transformations panel.'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							},
							start: A3(
								_ezacharias$sftm$Term$Binary,
								_ezacharias$sftm$Term$Conjunction,
								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
							finish: A3(
								_ezacharias$sftm$Term$Binary,
								_ezacharias$sftm$Term$Conjunction,
								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
							rules: {
								ctor: '::',
								_0: _ezacharias$sftm$Rules$implosionRule,
								_1: {ctor: '[]'}
							},
							scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
						},
						_1: {
							ctor: '::',
							_0: {
								description: 'Use implosion with two options.',
								notes: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$p,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('If there is more than one expression in the context, the implosion transformation will give you a choice of which expression to use to replace '),
											_1: {
												ctor: '::',
												_0: _ezacharias$sftm$Render$topHtml,
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text('.'),
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('When you navigate to '),
												_1: {
													ctor: '::',
													_0: _ezacharias$sftm$Render$topHtml,
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text(', '),
														_1: {
															ctor: '::',
															_0: _ezacharias$sftm$Render$latinUpperAHtml,
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html$text(' and '),
																_1: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Render$latinUpperBHtml,
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html$text(' are added to the context individually rather than the entire expression '),
																		_1: {
																			ctor: '::',
																			_0: _ezacharias$sftm$Render$termSpan(
																				A3(
																					_ezacharias$sftm$Term$Binary,
																					_ezacharias$sftm$Term$Conjunction,
																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('.'),
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}),
										_1: {ctor: '[]'}
									}
								},
								start: A3(
									_ezacharias$sftm$Term$Binary,
									_ezacharias$sftm$Term$Conjunction,
									A3(
										_ezacharias$sftm$Term$Binary,
										_ezacharias$sftm$Term$Conjunction,
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
								finish: A3(
									_ezacharias$sftm$Term$Binary,
									_ezacharias$sftm$Term$Conjunction,
									A3(
										_ezacharias$sftm$Term$Binary,
										_ezacharias$sftm$Term$Conjunction,
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
								rules: {
									ctor: '::',
									_0: _ezacharias$sftm$Rules$implosionRule,
									_1: {ctor: '[]'}
								},
								scratch: {
									ctor: '::',
									_0: _ezacharias$sftm$Symbol$VarA,
									_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols1}
								}
							},
							_1: {
								ctor: '::',
								_0: {
									description: 'Prove idempotency for conjunction.',
									notes: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Time for your first proof.'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$p,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('You will prove a basic property of conjunction using the two rules you’ve encountered. This property is called '),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$em,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('idempotency'),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html$text(', which means if you have the same expression on both sides of a conjunction, you can replace the conjunction with one copy of the expression.'),
															_1: {ctor: '[]'}
														}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$p,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Every transformation you apply shows up as a step in the history panel. If you want to undo a transformation, you can either use the undo button at the top of the transformations panel or go to the history panel and click on a previous step.'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$p,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('If you switch to the goal formula, the history panel becomes the future panel and shows you any transformations you apply working from the goal backwards.'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									start: A3(
										_ezacharias$sftm$Term$Binary,
										_ezacharias$sftm$Term$Conjunction,
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
									finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
									rules: {
										ctor: '::',
										_0: _ezacharias$sftm$Rules$implosionRule,
										_1: {
											ctor: '::',
											_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
											_1: {ctor: '[]'}
										}
									},
									scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
								},
								_1: {
									ctor: '::',
									_0: {
										description: 'Prove left identity for conjunction.',
										notes: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$p,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Your task is to add '),
													_1: {
														ctor: '::',
														_0: _ezacharias$sftm$Render$topHtml,
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html$text(' to the left of '),
															_1: {
																ctor: '::',
																_0: _ezacharias$sftm$Render$latinUpperAHtml,
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('. This is similar to what the identity rule does, except the identity rule adds '),
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$topHtml,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(' to to the right of an expression instead of the left.'),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$p,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Once you’ve solved a problem and clicked '),
														_1: {
															ctor: '::',
															_0: _ezacharias$sftm$Graphics$lowerWhiteTombstone,
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html$text(', you can go back to the problem and review the steps you took by selecting Show proof from the menu at the top-right of the screen.'),
																_1: {ctor: '[]'}
															}
														}
													}),
												_1: {ctor: '[]'}
											}
										},
										start: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
										finish: A3(
											_ezacharias$sftm$Term$Binary,
											_ezacharias$sftm$Term$Conjunction,
											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
										rules: {
											ctor: '::',
											_0: _ezacharias$sftm$Rules$implosionRule,
											_1: {
												ctor: '::',
												_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
												_1: {ctor: '[]'}
											}
										},
										scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols1}
									},
									_1: {
										ctor: '::',
										_0: {
											description: 'Prove commutativity for conjunction.',
											notes: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$p,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('You may have already encountered commutativity when learning algebra. It’s usually given as a basic law. Here you will prove it using the rules you’ve been given.'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$p,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('After this problem, commutativity for conjunction will be added to your set of rules.'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											},
											start: A3(
												_ezacharias$sftm$Term$Binary,
												_ezacharias$sftm$Term$Conjunction,
												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
											finish: A3(
												_ezacharias$sftm$Term$Binary,
												_ezacharias$sftm$Term$Conjunction,
												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
											rules: {
												ctor: '::',
												_0: _ezacharias$sftm$Rules$implosionRule,
												_1: {
													ctor: '::',
													_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
													_1: {ctor: '[]'}
												}
											},
											scratch: {
												ctor: '::',
												_0: _ezacharias$sftm$Symbol$VarA,
												_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols1}
											}
										},
										_1: {
											ctor: '::',
											_0: {
												description: 'Prove associativity for conjunction.',
												notes: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$p,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('If you were already familiar commutativity, you probably guessed associativity would be next.'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$p,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('Are you getting used to looking at the context panel? It should come in handy here.'),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$p,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('After this problem, you will be given associativity for conjunction to use directly.'),
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}
													}
												},
												start: A3(
													_ezacharias$sftm$Term$Binary,
													_ezacharias$sftm$Term$Conjunction,
													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
													A3(
														_ezacharias$sftm$Term$Binary,
														_ezacharias$sftm$Term$Conjunction,
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
												finish: A3(
													_ezacharias$sftm$Term$Binary,
													_ezacharias$sftm$Term$Conjunction,
													A3(
														_ezacharias$sftm$Term$Binary,
														_ezacharias$sftm$Term$Conjunction,
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC)),
												rules: {
													ctor: '::',
													_0: _ezacharias$sftm$Rules$implosionRule,
													_1: {
														ctor: '::',
														_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
														_1: {
															ctor: '::',
															_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
															_1: {ctor: '[]'}
														}
													}
												},
												scratch: {
													ctor: '::',
													_0: _ezacharias$sftm$Symbol$VarA,
													_1: {
														ctor: '::',
														_0: _ezacharias$sftm$Symbol$VarB,
														_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarC, _1: _ezacharias$sftm$Problems$symbols1}
													}
												}
											},
											_1: {
												ctor: '::',
												_0: {
													description: 'Use explosion.',
													notes: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$p,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('The initial formula contains '),
																_1: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Render$botHtml,
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html$text(', which is the symbol '),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$html$Html$em,
																				{ctor: '[]'},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('false'),
																					_1: {ctor: '[]'}
																				}),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('. It is a flipped over '),
																				_1: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Render$topHtml,
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html$text('.'),
																						_1: {ctor: '[]'}
																					}
																				}
																			}
																		}
																	}
																}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$p,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('The first rule which uses '),
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$botHtml,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(' is the explosion rule:'),
																			_1: {ctor: '[]'}
																		}
																	}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$p,
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$class('center-text'),
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$ruleSpan(_ezacharias$sftm$Rules$explosionRule),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$p,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('It can be read out loud as, “if false is in the context, you can replace true with anything”.'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$p,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('Here you will use explosion in a way similar to how implosion is used: to replace '),
																				_1: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Render$latinUpperAHtml,
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html$text(' with '),
																						_1: {
																							ctor: '::',
																							_0: _ezacharias$sftm$Render$topHtml,
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('. In the next problem, you will discover what makes the explosion rule unique.'),
																								_1: {ctor: '[]'}
																							}
																						}
																					}
																				}
																			}),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													},
													start: A3(
														_ezacharias$sftm$Term$Binary,
														_ezacharias$sftm$Term$Conjunction,
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
													finish: A3(
														_ezacharias$sftm$Term$Binary,
														_ezacharias$sftm$Term$Conjunction,
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
													rules: {
														ctor: '::',
														_0: _ezacharias$sftm$Rules$explosionRule,
														_1: {ctor: '[]'}
													},
													scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
												},
												_1: {
													ctor: '::',
													_0: {
														description: 'Use explosion in the other direction.',
														notes: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$p,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('When '),
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$botHtml,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(' is in the context, the explosion rule can replace '),
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Render$topHtml,
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(' with anything. So how does the transformation decide what to use to replace '),
																					_1: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Render$topHtml,
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('? It will ask you to choose from among expressions it finds in the scratch pad.'),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$p,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Currently, the scratch pad is empty. If you navigate to '),
																		_1: {
																			ctor: '::',
																			_0: _ezacharias$sftm$Render$topHtml,
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(', the explosion rule does not even show up in the transformations panel.'),
																				_1: {ctor: '[]'}
																			}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$p,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Let\'s add an expression. First, go to the scratch pad panel and click Add. Then click the '),
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Render$latinUpperAHtml,
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(' symbol in the list and click OK to add it to the scratch pad.'),
																					_1: {ctor: '[]'}
																				}
																			}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$p,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('If you want, you can play around with the scratch pad to build more complex expressions. You can always copy the current focus to the scratch pad by clicking Add and then clicking OK without selecting anything else.'),
																				_1: {ctor: '[]'}
																			}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$html$Html$p,
																				{ctor: '[]'},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('Once at least one expression is in the scratch pad you should be able to use the explosion rule. A very common mistake when solving problems is to forget to add expressions to the scratch pad.'),
																					_1: {ctor: '[]'}
																				}),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														},
														start: A3(
															_ezacharias$sftm$Term$Binary,
															_ezacharias$sftm$Term$Conjunction,
															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
														finish: A3(
															_ezacharias$sftm$Term$Binary,
															_ezacharias$sftm$Term$Conjunction,
															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
														rules: {
															ctor: '::',
															_0: _ezacharias$sftm$Rules$explosionRule,
															_1: {ctor: '[]'}
														},
														scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
													},
													_1: {
														ctor: '::',
														_0: {
															description: 'Prove annihilation for conjunction.',
															notes: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$p,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: _ezacharias$sftm$Render$botHtml,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(' is the annihilator for conjunction. This is because if '),
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Render$botHtml,
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(' is one one side of a conjunction, it can annihilate whatever is on the other side, replacing the entire expression with '),
																					_1: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Render$botHtml,
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('.'),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$p,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('After this problem, you will be given annihilation for conjunction to use directly.'),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															},
															start: A3(
																_ezacharias$sftm$Term$Binary,
																_ezacharias$sftm$Term$Conjunction,
																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
															finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
															rules: {
																ctor: '::',
																_0: _ezacharias$sftm$Rules$implosionRule,
																_1: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Rules$explosionRule,
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																		_1: {
																			ctor: '::',
																			_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															},
															scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
														},
														_1: {
															ctor: '::',
															_0: {
																description: 'Demonstrate arbitrary transformation.',
																notes: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$p,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _ezacharias$sftm$Render$botHtml,
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(' can be used to transform anything into anything in a conjunction.'),
																				_1: {ctor: '[]'}
																			}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$p,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('Remember to use the scratch pad.'),
																				_1: {ctor: '[]'}
																			}),
																		_1: {ctor: '[]'}
																	}
																},
																start: A3(
																	_ezacharias$sftm$Term$Binary,
																	_ezacharias$sftm$Term$Conjunction,
																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																finish: A3(
																	_ezacharias$sftm$Term$Binary,
																	_ezacharias$sftm$Term$Conjunction,
																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																rules: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Rules$implosionRule,
																	_1: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Rules$explosionRule,
																		_1: {
																			ctor: '::',
																			_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																			_1: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																				_1: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																					_1: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																						_1: {ctor: '[]'}
																					}
																				}
																			}
																		}
																	}
																},
																scratch: {
																	ctor: '::',
																	_0: _ezacharias$sftm$Symbol$VarA,
																	_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																}
															},
															_1: {
																ctor: '::',
																_0: {
																	description: 'Use identity for disjunction.',
																	notes: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$html$Html$p,
																			{ctor: '[]'},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text('In the the initial formula, the '),
																				_1: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Render$disjunctionHtml,
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html$text(' symbol is called '),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_elm_lang$html$Html$em,
																								{ctor: '[]'},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('disjunction'),
																									_1: {ctor: '[]'}
																								}),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html$text(' or '),
																								_1: {
																									ctor: '::',
																									_0: A2(
																										_elm_lang$html$Html$em,
																										{ctor: '[]'},
																										{
																											ctor: '::',
																											_0: _elm_lang$html$Html$text('logical-or'),
																											_1: {ctor: '[]'}
																										}),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$html$Html$text('. For it to be true, either the left side, the right side, or both the left and right side must be true. For it to be false, both the left and right side must be false.'),
																										_1: {ctor: '[]'}
																									}
																								}
																							}
																						}
																					}
																				}
																			}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$html$Html$p,
																				{ctor: '[]'},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('While the identity for conjunction is '),
																					_1: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Render$topHtml,
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(', the identity for disjunction is '),
																							_1: {
																								ctor: '::',
																								_0: _ezacharias$sftm$Render$botHtml,
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('.'),
																									_1: {ctor: '[]'}
																								}
																							}
																						}
																					}
																				}),
																			_1: {ctor: '[]'}
																		}
																	},
																	start: A3(
																		_ezacharias$sftm$Term$Binary,
																		_ezacharias$sftm$Term$Disjunction,
																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot)),
																	finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																	rules: {
																		ctor: '::',
																		_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																		_1: {ctor: '[]'}
																	},
																	scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
																},
																_1: {
																	ctor: '::',
																	_0: {
																		description: 'Use annihilation for disjunction.',
																		notes: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$html$Html$p,
																				{ctor: '[]'},
																				{
																					ctor: '::',
																					_0: _ezacharias$sftm$Render$topHtml,
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html$text(' is the annihilator for disjunction.'),
																						_1: {ctor: '[]'}
																					}
																				}),
																			_1: {ctor: '[]'}
																		},
																		start: A3(
																			_ezacharias$sftm$Term$Binary,
																			_ezacharias$sftm$Term$Disjunction,
																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																		finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
																		rules: {
																			ctor: '::',
																			_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																			_1: {ctor: '[]'}
																		},
																		scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
																	},
																	_1: {
																		ctor: '::',
																		_0: {
																			description: 'Use commutativity for disjunction.',
																			notes: {
																				ctor: '::',
																				_0: A2(
																					_elm_lang$html$Html$p,
																					{ctor: '[]'},
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html$text('Commutativity works exactly the same as for conjunction.'),
																						_1: {ctor: '[]'}
																					}),
																				_1: {ctor: '[]'}
																			},
																			start: A3(
																				_ezacharias$sftm$Term$Binary,
																				_ezacharias$sftm$Term$Disjunction,
																				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																			finish: A3(
																				_ezacharias$sftm$Term$Binary,
																				_ezacharias$sftm$Term$Disjunction,
																				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																				_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																			rules: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																				_1: {ctor: '[]'}
																			},
																			scratch: {
																				ctor: '::',
																				_0: _ezacharias$sftm$Symbol$VarA,
																				_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																			}
																		},
																		_1: {
																			ctor: '::',
																			_0: {
																				description: 'Use distribution of conjunction over disjunction.',
																				notes: {
																					ctor: '::',
																					_0: A2(
																						_elm_lang$html$Html$p,
																						{ctor: '[]'},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text('The distribution rule is similar to distribution of multiplication over addition in algebra.'),
																							_1: {ctor: '[]'}
																						}),
																					_1: {ctor: '[]'}
																				},
																				start: A3(
																					_ezacharias$sftm$Term$Binary,
																					_ezacharias$sftm$Term$Conjunction,
																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																					A3(
																						_ezacharias$sftm$Term$Binary,
																						_ezacharias$sftm$Term$Disjunction,
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																				finish: A3(
																					_ezacharias$sftm$Term$Binary,
																					_ezacharias$sftm$Term$Disjunction,
																					A3(
																						_ezacharias$sftm$Term$Binary,
																						_ezacharias$sftm$Term$Conjunction,
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																					A3(
																						_ezacharias$sftm$Term$Binary,
																						_ezacharias$sftm$Term$Conjunction,
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																				rules: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																					_1: {ctor: '[]'}
																				},
																				scratch: {
																					ctor: '::',
																					_0: _ezacharias$sftm$Symbol$VarA,
																					_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																				}
																			},
																			_1: {
																				ctor: '::',
																				_0: {
																					description: 'Prove idempotency for disjunction.',
																					notes: {
																						ctor: '::',
																						_0: A2(
																							_elm_lang$html$Html$p,
																							{ctor: '[]'},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Disjunction adds expressions to the context differently from conjunction in two important ways. First, if you are on one side of a disjunction, the other side is not added to the context. Second, if an entire disjunction is added to the context, it is not broken up.'),
																								_1: {ctor: '[]'}
																							}),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_elm_lang$html$Html$p,
																								{ctor: '[]'},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('Because disjunction uses the context in a more limited way, proofs involving disjunction tend to be more complex and challenging than proofs involving conjunction alone.'),
																									_1: {ctor: '[]'}
																								}),
																							_1: {ctor: '[]'}
																						}
																					},
																					start: A3(
																						_ezacharias$sftm$Term$Binary,
																						_ezacharias$sftm$Term$Disjunction,
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																					finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																					rules: {
																						ctor: '::',
																						_0: _ezacharias$sftm$Rules$implosionRule,
																						_1: {
																							ctor: '::',
																							_0: _ezacharias$sftm$Rules$explosionRule,
																							_1: {
																								ctor: '::',
																								_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																								_1: {
																									ctor: '::',
																									_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																									_1: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																															_1: {ctor: '[]'}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					},
																					scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols3}
																				},
																				_1: {
																					ctor: '::',
																					_0: {
																						description: 'Prove absorption for conjunction.',
																						notes: {
																							ctor: '::',
																							_0: A2(
																								_elm_lang$html$Html$p,
																								{ctor: '[]'},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('This is a proof which helps show how conjunction and disjunction relate to one-another.'),
																									_1: {ctor: '[]'}
																								}),
																							_1: {ctor: '[]'}
																						},
																						start: A3(
																							_ezacharias$sftm$Term$Binary,
																							_ezacharias$sftm$Term$Conjunction,
																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																							A3(
																								_ezacharias$sftm$Term$Binary,
																								_ezacharias$sftm$Term$Disjunction,
																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																						finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																						rules: {
																							ctor: '::',
																							_0: _ezacharias$sftm$Rules$implosionRule,
																							_1: {
																								ctor: '::',
																								_0: _ezacharias$sftm$Rules$explosionRule,
																								_1: {
																									ctor: '::',
																									_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																									_1: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																_1: {ctor: '[]'}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						},
																						scratch: {
																							ctor: '::',
																							_0: _ezacharias$sftm$Symbol$VarA,
																							_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																						}
																					},
																					_1: {
																						ctor: '::',
																						_0: {
																							description: 'Prove absorption for disjunction.',
																							notes: {
																								ctor: '::',
																								_0: A2(
																									_elm_lang$html$Html$p,
																									{ctor: '[]'},
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html$text('This is the same as the previous problem, except the conjunction and disjunction operators have been exchanged.'),
																										_1: {ctor: '[]'}
																									}),
																								_1: {ctor: '[]'}
																							},
																							start: A3(
																								_ezacharias$sftm$Term$Binary,
																								_ezacharias$sftm$Term$Disjunction,
																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																								A3(
																									_ezacharias$sftm$Term$Binary,
																									_ezacharias$sftm$Term$Conjunction,
																									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																							finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																							rules: {
																								ctor: '::',
																								_0: _ezacharias$sftm$Rules$implosionRule,
																								_1: {
																									ctor: '::',
																									_0: _ezacharias$sftm$Rules$explosionRule,
																									_1: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																	_1: {ctor: '[]'}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							},
																							scratch: {
																								ctor: '::',
																								_0: _ezacharias$sftm$Symbol$VarA,
																								_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																							}
																						},
																						_1: {
																							ctor: '::',
																							_0: {
																								description: 'Relate both absorptions.',
																								notes: {
																									ctor: '::',
																									_0: A2(
																										_elm_lang$html$Html$p,
																										{ctor: '[]'},
																										{
																											ctor: '::',
																											_0: _elm_lang$html$Html$text('Here you will go directly from the initial formula of absorption for conjunction to the initial formula of absorption for disjunction.'),
																											_1: {ctor: '[]'}
																										}),
																									_1: {ctor: '[]'}
																								},
																								start: A3(
																									_ezacharias$sftm$Term$Binary,
																									_ezacharias$sftm$Term$Conjunction,
																									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																									A3(
																										_ezacharias$sftm$Term$Binary,
																										_ezacharias$sftm$Term$Disjunction,
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																								finish: A3(
																									_ezacharias$sftm$Term$Binary,
																									_ezacharias$sftm$Term$Disjunction,
																									_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																									A3(
																										_ezacharias$sftm$Term$Binary,
																										_ezacharias$sftm$Term$Conjunction,
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																								rules: {
																									ctor: '::',
																									_0: _ezacharias$sftm$Rules$implosionRule,
																									_1: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Rules$explosionRule,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																		_1: {ctor: '[]'}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								},
																								scratch: {
																									ctor: '::',
																									_0: _ezacharias$sftm$Symbol$VarA,
																									_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																								}
																							},
																							_1: {
																								ctor: '::',
																								_0: {
																									description: 'Demonstrate absorption with association.',
																									notes: {
																										ctor: '::',
																										_0: A2(
																											_elm_lang$html$Html$p,
																											{ctor: '[]'},
																											{
																												ctor: '::',
																												_0: _elm_lang$html$Html$text('This is an absorption problem where '),
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Render$termSpan(
																														A3(
																															_ezacharias$sftm$Term$Binary,
																															_ezacharias$sftm$Term$Disjunction,
																															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																													_1: {
																														ctor: '::',
																														_0: _elm_lang$html$Html$text(' must absorb '),
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Render$latinUpperCHtml,
																															_1: {
																																ctor: '::',
																																_0: _elm_lang$html$Html$text('. However, the parenthesis on the right-hand side surround '),
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Render$termSpan(
																																		A3(
																																			_ezacharias$sftm$Term$Binary,
																																			_ezacharias$sftm$Term$Disjunction,
																																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																																	_1: {
																																		ctor: '::',
																																		_0: _elm_lang$html$Html$text(' rather than '),
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Render$termSpan(
																																				A3(
																																					_ezacharias$sftm$Term$Binary,
																																					_ezacharias$sftm$Term$Disjunction,
																																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																																			_1: {
																																				ctor: '::',
																																				_0: _elm_lang$html$Html$text('.'),
																																				_1: {ctor: '[]'}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}),
																										_1: {ctor: '[]'}
																									},
																									start: A3(
																										_ezacharias$sftm$Term$Binary,
																										_ezacharias$sftm$Term$Conjunction,
																										A3(
																											_ezacharias$sftm$Term$Binary,
																											_ezacharias$sftm$Term$Disjunction,
																											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																										A3(
																											_ezacharias$sftm$Term$Binary,
																											_ezacharias$sftm$Term$Disjunction,
																											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																											A3(
																												_ezacharias$sftm$Term$Binary,
																												_ezacharias$sftm$Term$Disjunction,
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC)))),
																									finish: A3(
																										_ezacharias$sftm$Term$Binary,
																										_ezacharias$sftm$Term$Disjunction,
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																										_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																									rules: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Rules$implosionRule,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$explosionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																			_1: {ctor: '[]'}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									},
																									scratch: {
																										ctor: '::',
																										_0: _ezacharias$sftm$Symbol$VarA,
																										_1: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Symbol$VarB,
																											_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarC, _1: _ezacharias$sftm$Problems$symbols3}
																										}
																									}
																								},
																								_1: {
																									ctor: '::',
																									_0: {
																										description: 'Prove associativity for disjunction.',
																										notes: {
																											ctor: '::',
																											_0: A2(
																												_elm_lang$html$Html$p,
																												{ctor: '[]'},
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html$text('If you have trouble with this proof, try solving the previous four absorption problems from the goal backwards.'),
																													_1: {ctor: '[]'}
																												}),
																											_1: {
																												ctor: '::',
																												_0: A2(
																													_elm_lang$html$Html$p,
																													{ctor: '[]'},
																													{
																														ctor: '::',
																														_0: _elm_lang$html$Html$text('After this problem, you will be given associativity for disjunction to use directly.'),
																														_1: {ctor: '[]'}
																													}),
																												_1: {ctor: '[]'}
																											}
																										},
																										start: A3(
																											_ezacharias$sftm$Term$Binary,
																											_ezacharias$sftm$Term$Disjunction,
																											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																											A3(
																												_ezacharias$sftm$Term$Binary,
																												_ezacharias$sftm$Term$Disjunction,
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																										finish: A3(
																											_ezacharias$sftm$Term$Binary,
																											_ezacharias$sftm$Term$Disjunction,
																											A3(
																												_ezacharias$sftm$Term$Binary,
																												_ezacharias$sftm$Term$Disjunction,
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																											_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC)),
																										rules: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Rules$implosionRule,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$explosionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																				_1: {ctor: '[]'}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										},
																										scratch: {
																											ctor: '::',
																											_0: _ezacharias$sftm$Symbol$VarA,
																											_1: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Symbol$VarB,
																												_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarC, _1: _ezacharias$sftm$Problems$symbols3}
																											}
																										}
																									},
																									_1: {
																										ctor: '::',
																										_0: {
																											description: 'Prove distribution of disjunction over conjunction.',
																											notes: {
																												ctor: '::',
																												_0: A2(
																													_elm_lang$html$Html$p,
																													{ctor: '[]'},
																													{
																														ctor: '::',
																														_0: _elm_lang$html$Html$text('You already have distribution of conjunction over disjunction.'),
																														_1: {ctor: '[]'}
																													}),
																												_1: {
																													ctor: '::',
																													_0: A2(
																														_elm_lang$html$Html$p,
																														{ctor: '[]'},
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html$text('If you turn your phone sideways (landscape mode), you can view long formulas more easily.'),
																															_1: {ctor: '[]'}
																														}),
																													_1: {
																														ctor: '::',
																														_0: A2(
																															_elm_lang$html$Html$p,
																															{ctor: '[]'},
																															{
																																ctor: '::',
																																_0: _elm_lang$html$Html$text('After this problem, you will be given distribution of disjunction over conjunction to use directly.'),
																																_1: {ctor: '[]'}
																															}),
																														_1: {ctor: '[]'}
																													}
																												}
																											},
																											start: A3(
																												_ezacharias$sftm$Term$Binary,
																												_ezacharias$sftm$Term$Disjunction,
																												_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																												A3(
																													_ezacharias$sftm$Term$Binary,
																													_ezacharias$sftm$Term$Conjunction,
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																											finish: A3(
																												_ezacharias$sftm$Term$Binary,
																												_ezacharias$sftm$Term$Conjunction,
																												A3(
																													_ezacharias$sftm$Term$Binary,
																													_ezacharias$sftm$Term$Disjunction,
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																												A3(
																													_ezacharias$sftm$Term$Binary,
																													_ezacharias$sftm$Term$Disjunction,
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarC))),
																											rules: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Rules$implosionRule,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$explosionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																						_1: {ctor: '[]'}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											},
																											scratch: {
																												ctor: '::',
																												_0: _ezacharias$sftm$Symbol$VarA,
																												_1: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Symbol$VarB,
																													_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarC, _1: _ezacharias$sftm$Problems$symbols3}
																												}
																											}
																										},
																										_1: {
																											ctor: '::',
																											_0: {
																												description: 'Prove disjunction is inclusive.',
																												notes: {
																													ctor: '::',
																													_0: A2(
																														_elm_lang$html$Html$p,
																														{ctor: '[]'},
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html$text('Hint: Try working from the goal backwards.'),
																															_1: {ctor: '[]'}
																														}),
																													_1: {ctor: '[]'}
																												},
																												start: A3(
																													_ezacharias$sftm$Term$Binary,
																													_ezacharias$sftm$Term$Disjunction,
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																													_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																												finish: A3(
																													_ezacharias$sftm$Term$Binary,
																													_ezacharias$sftm$Term$Disjunction,
																													A3(
																														_ezacharias$sftm$Term$Binary,
																														_ezacharias$sftm$Term$Disjunction,
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																													A3(
																														_ezacharias$sftm$Term$Binary,
																														_ezacharias$sftm$Term$Conjunction,
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																												rules: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Rules$implosionRule,
																													_1: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$explosionRule,
																														_1: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																															_1: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																								_1: {ctor: '[]'}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												},
																												scratch: {
																													ctor: '::',
																													_0: _ezacharias$sftm$Symbol$VarA,
																													_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols3}
																												}
																											},
																											_1: {
																												ctor: '::',
																												_0: {
																													description: 'Use reflexivity for equivalence.',
																													notes: {
																														ctor: '::',
																														_0: A2(
																															_elm_lang$html$Html$p,
																															{ctor: '[]'},
																															{
																																ctor: '::',
																																_0: _elm_lang$html$Html$text('In the goal formula, the '),
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Render$equivalenceHtml,
																																	_1: {
																																		ctor: '::',
																																		_0: _elm_lang$html$Html$text(' symbol is called '),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(
																																				_elm_lang$html$Html$em,
																																				{ctor: '[]'},
																																				{
																																					ctor: '::',
																																					_0: _elm_lang$html$Html$text('equivalence'),
																																					_1: {ctor: '[]'}
																																				}),
																																			_1: {
																																				ctor: '::',
																																				_0: _elm_lang$html$Html$text('. It is a shorter version of the arrow used in the rules. An equivalence is true if there’s some way to transform the left side into the right side, and the other way around. It is false if this is impossible.'),
																																				_1: {ctor: '[]'}
																																			}
																																		}
																																	}
																																}
																															}),
																														_1: {
																															ctor: '::',
																															_0: A2(
																																_elm_lang$html$Html$p,
																																{ctor: '[]'},
																																{
																																	ctor: '::',
																																	_0: _elm_lang$html$Html$text('Here is the reflexivity rule:'),
																																	_1: {ctor: '[]'}
																																}),
																															_1: {
																																ctor: '::',
																																_0: A2(
																																	_elm_lang$html$Html$p,
																																	{
																																		ctor: '::',
																																		_0: _elm_lang$html$Html_Attributes$class('center-text'),
																																		_1: {ctor: '[]'}
																																	},
																																	{
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Render$ruleSpan(_ezacharias$sftm$Rules$reflexivityForEquivalenceRule),
																																		_1: {ctor: '[]'}
																																	}),
																																_1: {
																																	ctor: '::',
																																	_0: A2(
																																		_elm_lang$html$Html$p,
																																		{ctor: '[]'},
																																		{
																																			ctor: '::',
																																			_0: _elm_lang$html$Html$text('It works because any expression can be transformed into itself (no transformation is needed).'),
																																			_1: {ctor: '[]'}
																																		}),
																																	_1: {
																																		ctor: '::',
																																		_0: A2(
																																			_elm_lang$html$Html$p,
																																			{ctor: '[]'},
																																			{
																																				ctor: '::',
																																				_0: _elm_lang$html$Html$text('Every problem you have solved has been a proof of an equivalence. That is, you have proven the initial formula is equivalent to (can be transformed into) the goal formula.'),
																																				_1: {ctor: '[]'}
																																			}),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(
																																				_elm_lang$html$Html$p,
																																				{ctor: '[]'},
																																				{
																																					ctor: '::',
																																					_0: _elm_lang$html$Html$text('Don’t forget to add expressions to the scratch pad to make them available for reflexivity.'),
																																					_1: {ctor: '[]'}
																																				}),
																																			_1: {ctor: '[]'}
																																		}
																																	}
																																}
																															}
																														}
																													},
																													start: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
																													finish: A3(
																														_ezacharias$sftm$Term$Binary,
																														_ezacharias$sftm$Term$Equivalence,
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																														_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																													rules: {
																														ctor: '::',
																														_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																														_1: {ctor: '[]'}
																													},
																													scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols4}
																												},
																												_1: {
																													ctor: '::',
																													_0: {
																														description: 'Use substitution.',
																														notes: {
																															ctor: '::',
																															_0: A2(
																																_elm_lang$html$Html$p,
																																{ctor: '[]'},
																																{
																																	ctor: '::',
																																	_0: _elm_lang$html$Html$text('If an equivalence is in the context, you can use it to perform substitution.'),
																																	_1: {ctor: '[]'}
																																}),
																															_1: {ctor: '[]'}
																														},
																														start: A3(
																															_ezacharias$sftm$Term$Binary,
																															_ezacharias$sftm$Term$Conjunction,
																															A3(
																																_ezacharias$sftm$Term$Binary,
																																_ezacharias$sftm$Term$Equivalence,
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																														finish: A3(
																															_ezacharias$sftm$Term$Binary,
																															_ezacharias$sftm$Term$Conjunction,
																															A3(
																																_ezacharias$sftm$Term$Binary,
																																_ezacharias$sftm$Term$Equivalence,
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																															_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																														rules: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Rules$substitutionRule,
																															_1: {ctor: '[]'}
																														},
																														scratch: {
																															ctor: '::',
																															_0: _ezacharias$sftm$Symbol$VarA,
																															_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																														}
																													},
																													_1: {
																														ctor: '::',
																														_0: {
																															description: 'Eliminate the equivalence.',
																															notes: {
																																ctor: '::',
																																_0: A2(
																																	_elm_lang$html$Html$p,
																																	{ctor: '[]'},
																																	{
																																		ctor: '::',
																																		_0: _elm_lang$html$Html$text('Equivalence adds expressions to the context similarly to disjunction. First, if you are on one side of an equivalence, the other side is not added to the context. Second, if an entire equivalence is added to the context, it is not broken up.'),
																																		_1: {ctor: '[]'}
																																	}),
																																_1: {ctor: '[]'}
																															},
																															start: A3(
																																_ezacharias$sftm$Term$Binary,
																																_ezacharias$sftm$Term$Conjunction,
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																A3(
																																	_ezacharias$sftm$Term$Binary,
																																	_ezacharias$sftm$Term$Equivalence,
																																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																															finish: A3(
																																_ezacharias$sftm$Term$Binary,
																																_ezacharias$sftm$Term$Conjunction,
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																															rules: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Rules$implosionRule,
																																_1: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$explosionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$substitutionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																													_1: {ctor: '[]'}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															},
																															scratch: {
																																ctor: '::',
																																_0: _ezacharias$sftm$Symbol$VarA,
																																_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																															}
																														},
																														_1: {
																															ctor: '::',
																															_0: {
																																description: 'Prove true is not equivalent to false.',
																																notes: {
																																	ctor: '::',
																																	_0: A2(
																																		_elm_lang$html$Html$p,
																																		{ctor: '[]'},
																																		{
																																			ctor: '::',
																																			_0: _elm_lang$html$Html$text('This proof shows it is not possible to transform true into false.'),
																																			_1: {ctor: '[]'}
																																		}),
																																	_1: {
																																		ctor: '::',
																																		_0: A2(
																																			_elm_lang$html$Html$p,
																																			{ctor: '[]'},
																																			{
																																				ctor: '::',
																																				_0: _elm_lang$html$Html$text('In a later problem you will discover what happens if the rules somehow make it possible to transform true into false.'),
																																				_1: {ctor: '[]'}
																																			}),
																																		_1: {ctor: '[]'}
																																	}
																																},
																																start: A3(
																																	_ezacharias$sftm$Term$Binary,
																																	_ezacharias$sftm$Term$Equivalence,
																																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
																																	_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot)),
																																finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
																																rules: {
																																	ctor: '::',
																																	_0: _ezacharias$sftm$Rules$implosionRule,
																																	_1: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$explosionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$substitutionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																														_1: {ctor: '[]'}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																},
																																scratch: _ezacharias$sftm$Problems$symbols4
																															},
																															_1: {
																																ctor: '::',
																																_0: {
																																	description: 'Prove symmetry for equivalence.',
																																	notes: {
																																		ctor: '::',
																																		_0: A2(
																																			_elm_lang$html$Html$p,
																																			{ctor: '[]'},
																																			{
																																				ctor: '::',
																																				_0: _elm_lang$html$Html$text('This is just commutativity. However, it’s rare to use the word commutativity for equivalence; the word symmetry is more common.'),
																																				_1: {ctor: '[]'}
																																			}),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(
																																				_elm_lang$html$Html$p,
																																				{ctor: '[]'},
																																				{
																																					ctor: '::',
																																					_0: _elm_lang$html$Html$text('After this problem, you will be given symmetry for equivalence to use directly.'),
																																					_1: {ctor: '[]'}
																																				}),
																																			_1: {ctor: '[]'}
																																		}
																																	},
																																	start: A3(
																																		_ezacharias$sftm$Term$Binary,
																																		_ezacharias$sftm$Term$Equivalence,
																																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																																	finish: A3(
																																		_ezacharias$sftm$Term$Binary,
																																		_ezacharias$sftm$Term$Equivalence,
																																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																																		_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA)),
																																	rules: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Rules$implosionRule,
																																		_1: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$explosionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$substitutionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																															_1: {ctor: '[]'}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	},
																																	scratch: {
																																		ctor: '::',
																																		_0: _ezacharias$sftm$Symbol$VarA,
																																		_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																																	}
																																},
																																_1: {
																																	ctor: '::',
																																	_0: {
																																		description: 'Prove identity for equivalence.',
																																		notes: {
																																			ctor: '::',
																																			_0: A2(
																																				_elm_lang$html$Html$p,
																																				{ctor: '[]'},
																																				{
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Render$topHtml,
																																					_1: {
																																						ctor: '::',
																																						_0: _elm_lang$html$Html$text(' is the identity for equivalence.'),
																																						_1: {ctor: '[]'}
																																					}
																																				}),
																																			_1: {
																																				ctor: '::',
																																				_0: A2(
																																					_elm_lang$html$Html$p,
																																					{ctor: '[]'},
																																					{
																																						ctor: '::',
																																						_0: _elm_lang$html$Html$text('Don’t forget to use the scratch pad.'),
																																						_1: {ctor: '[]'}
																																					}),
																																				_1: {
																																					ctor: '::',
																																					_0: A2(
																																						_elm_lang$html$Html$p,
																																						{ctor: '[]'},
																																						{
																																							ctor: '::',
																																							_0: _elm_lang$html$Html$text('After this problem, identity for equivalence will be added to your set of rules.'),
																																							_1: {ctor: '[]'}
																																						}),
																																					_1: {ctor: '[]'}
																																				}
																																			}
																																		},
																																		start: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																		finish: A3(
																																			_ezacharias$sftm$Term$Binary,
																																			_ezacharias$sftm$Term$Equivalence,
																																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																			_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top)),
																																		rules: {
																																			ctor: '::',
																																			_0: _ezacharias$sftm$Rules$implosionRule,
																																			_1: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$explosionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$substitutionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$identityForEquivalenceRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$symmetryForEquivalenceRule,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																															_1: {
																																																ctor: '::',
																																																_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																																_1: {
																																																	ctor: '::',
																																																	_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																																	_1: {
																																																		ctor: '::',
																																																		_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																																		_1: {ctor: '[]'}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		},
																																		scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols4}
																																	},
																																	_1: {
																																		ctor: '::',
																																		_0: {
																																			description: 'Prove false is not the annihilator for equivalence.',
																																			notes: {
																																				ctor: '::',
																																				_0: A2(
																																					_elm_lang$html$Html$p,
																																					{ctor: '[]'},
																																					{
																																						ctor: '::',
																																						_0: _elm_lang$html$Html$text('There is no annihilator for equivalence. However, a bad rule (annihilation for equivalence) has been added which treats '),
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Render$botHtml,
																																							_1: {
																																								ctor: '::',
																																								_0: _elm_lang$html$Html$text(' as the annihilator. You can prove the set of rules is now '),
																																								_1: {
																																									ctor: '::',
																																									_0: A2(
																																										_elm_lang$html$Html$em,
																																										{ctor: '[]'},
																																										{
																																											ctor: '::',
																																											_0: _elm_lang$html$Html$text('inconsistent'),
																																											_1: {ctor: '[]'}
																																										}),
																																									_1: {
																																										ctor: '::',
																																										_0: _elm_lang$html$Html$text(' by transforming '),
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Render$topHtml,
																																											_1: {
																																												ctor: '::',
																																												_0: _elm_lang$html$Html$text(' into '),
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Render$botHtml,
																																													_1: {
																																														ctor: '::',
																																														_0: _elm_lang$html$Html$text('; that is, when this rule is added, true can be transformed into false, which is a '),
																																														_1: {
																																															ctor: '::',
																																															_0: A2(
																																																_elm_lang$html$Html$em,
																																																{ctor: '[]'},
																																																{
																																																	ctor: '::',
																																																	_0: _elm_lang$html$Html$text('contradiction'),
																																																	_1: {ctor: '[]'}
																																																}),
																																															_1: {
																																																ctor: '::',
																																																_0: _elm_lang$html$Html$text('.'),
																																																_1: {ctor: '[]'}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}),
																																				_1: {
																																					ctor: '::',
																																					_0: A2(
																																						_elm_lang$html$Html$p,
																																						{ctor: '[]'},
																																						{
																																							ctor: '::',
																																							_0: _elm_lang$html$Html$text('Don’t forget to use the scratch pad.'),
																																							_1: {ctor: '[]'}
																																						}),
																																					_1: {
																																						ctor: '::',
																																						_0: A2(
																																							_elm_lang$html$Html$p,
																																							{ctor: '[]'},
																																							{
																																								ctor: '::',
																																								_0: _elm_lang$html$Html$text('Annihilation for equivalence is only used in this problem.'),
																																								_1: {ctor: '[]'}
																																							}),
																																						_1: {ctor: '[]'}
																																					}
																																				}
																																			},
																																			start: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Top),
																																			finish: _ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$Bot),
																																			rules: {
																																				ctor: '::',
																																				_0: _ezacharias$sftm$Rules$implosionRule,
																																				_1: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$explosionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$substitutionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$identityForEquivalenceRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$annihilationForEquivalenceRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																															_1: {
																																																ctor: '::',
																																																_0: _ezacharias$sftm$Rules$symmetryForEquivalenceRule,
																																																_1: {
																																																	ctor: '::',
																																																	_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																																	_1: {
																																																		ctor: '::',
																																																		_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																																		_1: {
																																																			ctor: '::',
																																																			_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																																			_1: {
																																																				ctor: '::',
																																																				_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																																				_1: {ctor: '[]'}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			},
																																			scratch: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarA, _1: _ezacharias$sftm$Problems$symbols4}
																																		},
																																		_1: {
																																			ctor: '::',
																																			_0: {
																																				description: 'Prove a relationship between conjunction and disjunction.',
																																				notes: {
																																					ctor: '::',
																																					_0: A2(
																																						_elm_lang$html$Html$p,
																																						{ctor: '[]'},
																																						{
																																							ctor: '::',
																																							_0: _elm_lang$html$Html$text('This is a proof which helps show how conjunction and disjunction relate to one-another.'),
																																							_1: {ctor: '[]'}
																																						}),
																																					_1: {ctor: '[]'}
																																				},
																																				start: A3(
																																					_ezacharias$sftm$Term$Binary,
																																					_ezacharias$sftm$Term$Equivalence,
																																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																					A3(
																																						_ezacharias$sftm$Term$Binary,
																																						_ezacharias$sftm$Term$Conjunction,
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																																				finish: A3(
																																					_ezacharias$sftm$Term$Binary,
																																					_ezacharias$sftm$Term$Equivalence,
																																					_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB),
																																					A3(
																																						_ezacharias$sftm$Term$Binary,
																																						_ezacharias$sftm$Term$Disjunction,
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																																				rules: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Rules$implosionRule,
																																					_1: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$explosionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$substitutionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$identityForEquivalenceRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																															_1: {
																																																ctor: '::',
																																																_0: _ezacharias$sftm$Rules$symmetryForEquivalenceRule,
																																																_1: {
																																																	ctor: '::',
																																																	_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																																	_1: {
																																																		ctor: '::',
																																																		_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																																		_1: {
																																																			ctor: '::',
																																																			_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																																			_1: {
																																																				ctor: '::',
																																																				_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																																				_1: {ctor: '[]'}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				},
																																				scratch: {
																																					ctor: '::',
																																					_0: _ezacharias$sftm$Symbol$VarA,
																																					_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																																				}
																																			},
																																			_1: {
																																				ctor: '::',
																																				_0: {
																																					description: 'Prove another relationship between conjunction and disjunction.',
																																					notes: {
																																						ctor: '::',
																																						_0: A2(
																																							_elm_lang$html$Html$p,
																																							{ctor: '[]'},
																																							{
																																								ctor: '::',
																																								_0: _elm_lang$html$Html$text('This is another proof which helps show how conjunction and disjunction relate to one-another.'),
																																								_1: {ctor: '[]'}
																																							}),
																																						_1: {ctor: '[]'}
																																					},
																																					start: A3(
																																						_ezacharias$sftm$Term$Binary,
																																						_ezacharias$sftm$Term$Equivalence,
																																						A3(
																																							_ezacharias$sftm$Term$Binary,
																																							_ezacharias$sftm$Term$Conjunction,
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																																						A3(
																																							_ezacharias$sftm$Term$Binary,
																																							_ezacharias$sftm$Term$Disjunction,
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																																					finish: A3(
																																						_ezacharias$sftm$Term$Binary,
																																						_ezacharias$sftm$Term$Equivalence,
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																						_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																																					rules: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Rules$implosionRule,
																																						_1: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$explosionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$substitutionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$identityForEquivalenceRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																															_1: {
																																																ctor: '::',
																																																_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																																_1: {
																																																	ctor: '::',
																																																	_0: _ezacharias$sftm$Rules$symmetryForEquivalenceRule,
																																																	_1: {
																																																		ctor: '::',
																																																		_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																																		_1: {
																																																			ctor: '::',
																																																			_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																																			_1: {
																																																				ctor: '::',
																																																				_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																																				_1: {
																																																					ctor: '::',
																																																					_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																																					_1: {ctor: '[]'}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					},
																																					scratch: {
																																						ctor: '::',
																																						_0: _ezacharias$sftm$Symbol$VarA,
																																						_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																																					}
																																				},
																																				_1: {
																																					ctor: '::',
																																					_0: {
																																						description: 'Express conjunction in terms of equivalence and disjunction.',
																																						notes: {
																																							ctor: '::',
																																							_0: A2(
																																								_elm_lang$html$Html$p,
																																								{ctor: '[]'},
																																								{
																																									ctor: '::',
																																									_0: _elm_lang$html$Html$text('This proof shows conjunction is no longer strictly necessary—it can be expressed in terms of disjunction and equivalence.'),
																																									_1: {ctor: '[]'}
																																								}),
																																							_1: {ctor: '[]'}
																																						},
																																						start: A3(
																																							_ezacharias$sftm$Term$Binary,
																																							_ezacharias$sftm$Term$Equivalence,
																																							A3(
																																								_ezacharias$sftm$Term$Binary,
																																								_ezacharias$sftm$Term$Equivalence,
																																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																																							A3(
																																								_ezacharias$sftm$Term$Binary,
																																								_ezacharias$sftm$Term$Disjunction,
																																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																								_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB))),
																																						finish: A3(
																																							_ezacharias$sftm$Term$Binary,
																																							_ezacharias$sftm$Term$Conjunction,
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarA),
																																							_ezacharias$sftm$Term$Atom(_ezacharias$sftm$Term$VarB)),
																																						rules: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Rules$implosionRule,
																																							_1: {
																																								ctor: '::',
																																								_0: _ezacharias$sftm$Rules$explosionRule,
																																								_1: {
																																									ctor: '::',
																																									_0: _ezacharias$sftm$Rules$substitutionRule,
																																									_1: {
																																										ctor: '::',
																																										_0: _ezacharias$sftm$Rules$reflexivityForEquivalenceRule,
																																										_1: {
																																											ctor: '::',
																																											_0: _ezacharias$sftm$Rules$identityForConjunctionRule,
																																											_1: {
																																												ctor: '::',
																																												_0: _ezacharias$sftm$Rules$identityForDisjunctionRule,
																																												_1: {
																																													ctor: '::',
																																													_0: _ezacharias$sftm$Rules$identityForEquivalenceRule,
																																													_1: {
																																														ctor: '::',
																																														_0: _ezacharias$sftm$Rules$annihilationForConjunctionRule,
																																														_1: {
																																															ctor: '::',
																																															_0: _ezacharias$sftm$Rules$annihilationForDisjunctionRule,
																																															_1: {
																																																ctor: '::',
																																																_0: _ezacharias$sftm$Rules$commutativityForConjunctionRule,
																																																_1: {
																																																	ctor: '::',
																																																	_0: _ezacharias$sftm$Rules$commutativityForDisjunctionRule,
																																																	_1: {
																																																		ctor: '::',
																																																		_0: _ezacharias$sftm$Rules$symmetryForEquivalenceRule,
																																																		_1: {
																																																			ctor: '::',
																																																			_0: _ezacharias$sftm$Rules$associativityForConjunctionRule,
																																																			_1: {
																																																				ctor: '::',
																																																				_0: _ezacharias$sftm$Rules$associativityForDisjunctionRule,
																																																				_1: {
																																																					ctor: '::',
																																																					_0: _ezacharias$sftm$Rules$distributionOfConjunctionOverDisjunction,
																																																					_1: {
																																																						ctor: '::',
																																																						_0: _ezacharias$sftm$Rules$distributionOfDisjunctionOverConjunction,
																																																						_1: {ctor: '[]'}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						},
																																						scratch: {
																																							ctor: '::',
																																							_0: _ezacharias$sftm$Symbol$VarA,
																																							_1: {ctor: '::', _0: _ezacharias$sftm$Symbol$VarB, _1: _ezacharias$sftm$Problems$symbols4}
																																						}
																																					},
																																					_1: {ctor: '[]'}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

var _ezacharias$sftm$Main$version = 34;
var _ezacharias$sftm$Main$fullPath = 'https://sftm.schlussweisen.com';
var _ezacharias$sftm$Main$mainPath = A2(_elm_lang$core$Basics_ops['++'], _ezacharias$sftm$Main$fullPath, '/');
var _ezacharias$sftm$Main$decodeLocalStorage = function (model) {
	var f = F2(
		function (version1, ps) {
			return _elm_lang$core$Native_Utils.eq(version1, _ezacharias$sftm$Main$version) ? _elm_lang$core$Native_Utils.update(
				model,
				{
					problems: A3(_elm_lang$core$List$map2, _ezacharias$sftm$Problem$restoreProblem, ps, model.problems)
				}) : model;
		});
	return A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'problems',
		_elm_lang$core$Json_Decode$list(_ezacharias$sftm$Problem$localStorageDecoder),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'version',
			_elm_lang$core$Json_Decode$int,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(f)));
};
var _ezacharias$sftm$Main$localStorageValue = function (model) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'version',
				_1: _elm_lang$core$Json_Encode$int(_ezacharias$sftm$Main$version)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'problems',
					_1: _elm_lang$core$Json_Encode$list(
						A2(_elm_lang$core$List$map, _ezacharias$sftm$Problem$encoder, model.problems))
				},
				_1: {ctor: '[]'}
			}
		});
};
var _ezacharias$sftm$Main$encodeLocalStorage = function (model) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		4,
		_ezacharias$sftm$Main$localStorageValue(model));
};
var _ezacharias$sftm$Main$currentSolvePageModel = function (model) {
	var _p0 = model.page;
	switch (_p0.ctor) {
		case 'ListPage':
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 497, column: 5},
					end: {line: 508, column: 37}
				},
				_p0)('impossible');
		case 'AboutPage':
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 497, column: 5},
					end: {line: 508, column: 37}
				},
				_p0)('impossible');
		case 'SolvePage':
			return _p0._1;
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 497, column: 5},
					end: {line: 508, column: 37}
				},
				_p0)('impossible');
	}
};
var _ezacharias$sftm$Main$problemIndex = function (model) {
	var _p4 = model.page;
	switch (_p4.ctor) {
		case 'ListPage':
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 476, column: 5},
					end: {line: 487, column: 37}
				},
				_p4)('impossible');
		case 'AboutPage':
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 476, column: 5},
					end: {line: 487, column: 37}
				},
				_p4)('impossible');
		case 'SolvePage':
			return _p4._0;
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 476, column: 5},
					end: {line: 487, column: 37}
				},
				_p4)('impossible');
	}
};
var _ezacharias$sftm$Main$setCurrentProblem = F2(
	function (problem, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				problems: A3(
					_ezacharias$sftm$Utilities$set,
					_ezacharias$sftm$Main$problemIndex(model),
					problem,
					model.problems)
			});
	});
var _ezacharias$sftm$Main$currentProblem = function (model) {
	return A2(
		_ezacharias$sftm$Utilities$unsafeGet,
		_ezacharias$sftm$Main$problemIndex(model),
		model.problems);
};
var _ezacharias$sftm$Main$setLocalStorage = function (_p8) {
	return _ezacharias$sftm$Ports$setLocalStorage(
		_ezacharias$sftm$Main$encodeLocalStorage(_p8));
};
var _ezacharias$sftm$Main$setPage = F2(
	function (isInit, path) {
		return isInit ? _ezacharias$sftm$Ports$setPage(path) : _elm_lang$core$Platform_Cmd$none;
	});
var _ezacharias$sftm$Main$Model = F3(
	function (a, b, c) {
		return {problems: a, scrollY: b, page: c};
	});
var _ezacharias$sftm$Main$Flags = function (a) {
	return {local: a};
};
var _ezacharias$sftm$Main$ProofPage = function (a) {
	return {ctor: 'ProofPage', _0: a};
};
var _ezacharias$sftm$Main$SolvePage = F2(
	function (a, b) {
		return {ctor: 'SolvePage', _0: a, _1: b};
	});
var _ezacharias$sftm$Main$modelUpdated = F2(
	function (newModel, currentModel) {
		var _p9 = currentModel.page;
		if (_p9.ctor === 'SolvePage') {
			var _p10 = _p9._0;
			var newProblem = A2(_ezacharias$sftm$Utilities$unsafeGet, _p10, newModel.problems);
			var currentProblem = A2(_ezacharias$sftm$Utilities$unsafeGet, _p10, currentModel.problems);
			return _elm_lang$core$Native_Utils.eq(currentProblem, newProblem) ? newModel : _elm_lang$core$Native_Utils.update(
				newModel,
				{
					page: A2(
						_ezacharias$sftm$Main$SolvePage,
						_p10,
						A2(_ezacharias$sftm$Page_Solve$init, _p10, newProblem))
				});
		} else {
			return newModel;
		}
	});
var _ezacharias$sftm$Main$setCurrentSolvePageModel = F2(
	function (solvePageModel, model) {
		var _p11 = model.page;
		switch (_p11.ctor) {
			case 'ListPage':
				return _elm_lang$core$Native_Utils.crashCase(
					'Main',
					{
						start: {line: 513, column: 5},
						end: {line: 524, column: 37}
					},
					_p11)('impossible');
			case 'AboutPage':
				return _elm_lang$core$Native_Utils.crashCase(
					'Main',
					{
						start: {line: 513, column: 5},
						end: {line: 524, column: 37}
					},
					_p11)('impossible');
			case 'SolvePage':
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						page: A2(_ezacharias$sftm$Main$SolvePage, _p11._0, solvePageModel)
					});
			default:
				return _elm_lang$core$Native_Utils.crashCase(
					'Main',
					{
						start: {line: 513, column: 5},
						end: {line: 524, column: 37}
					},
					_p11)('impossible');
		}
	});
var _ezacharias$sftm$Main$AboutPage = {ctor: 'AboutPage'};
var _ezacharias$sftm$Main$aboutLocation = F2(
	function (isInit, model) {
		var _p15 = model.page;
		if (_p15.ctor === 'AboutPage') {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var newModel = _elm_lang$core$Native_Utils.update(
				model,
				{page: _ezacharias$sftm$Main$AboutPage});
			return {
				ctor: '_Tuple2',
				_0: newModel,
				_1: _elm_lang$core$Platform_Cmd$batch(
					{
						ctor: '::',
						_0: A2(_ezacharias$sftm$Main$setPage, isInit, '/about/'),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Main$setLocalStorage(newModel),
							_1: {ctor: '[]'}
						}
					})
			};
		}
	});
var _ezacharias$sftm$Main$ListPage = {ctor: 'ListPage'};
var _ezacharias$sftm$Main$initialModel = {
	problems: _ezacharias$sftm$Problem$init(_ezacharias$sftm$Problems$problems),
	page: _ezacharias$sftm$Main$ListPage,
	scrollY: 0.0
};
var _ezacharias$sftm$Main$decodeModel = function (storage) {
	var decodeLocal = function (str) {
		var _p16 = A2(
			_elm_lang$core$Json_Decode$decodeString,
			_ezacharias$sftm$Main$decodeLocalStorage(_ezacharias$sftm$Main$initialModel),
			str);
		if (_p16.ctor === 'Ok') {
			return _p16._0;
		} else {
			return A2(_elm_lang$core$Debug$log, _p16._0, _ezacharias$sftm$Main$initialModel);
		}
	};
	var model = A2(
		_elm_lang$core$Maybe$withDefault,
		_ezacharias$sftm$Main$initialModel,
		A2(_elm_lang$core$Maybe$map, decodeLocal, storage.local));
	return model;
};
var _ezacharias$sftm$Main$SolvePageMsg = function (a) {
	return {ctor: 'SolvePageMsg', _0: a};
};
var _ezacharias$sftm$Main$AboutBackButtonClickedMsg = {ctor: 'AboutBackButtonClickedMsg'};
var _ezacharias$sftm$Main$LocationUpdateMsg = function (a) {
	return {ctor: 'LocationUpdateMsg', _0: a};
};
var _ezacharias$sftm$Main$SaveScrollMsg = function (a) {
	return {ctor: 'SaveScrollMsg', _0: a};
};
var _ezacharias$sftm$Main$OnScrollMsg = {ctor: 'OnScrollMsg'};
var _ezacharias$sftm$Main$GoToAboutMsg = {ctor: 'GoToAboutMsg'};
var _ezacharias$sftm$Main$GoToProblemMsg = function (a) {
	return {ctor: 'GoToProblemMsg', _0: a};
};
var _ezacharias$sftm$Main$listMsg = function (msg) {
	var _p17 = msg;
	switch (_p17.ctor) {
		case 'GoToProblemMsg':
			return _ezacharias$sftm$Main$GoToProblemMsg(_p17._0);
		case 'GoToAboutMsg':
			return _ezacharias$sftm$Main$GoToAboutMsg;
		default:
			return _ezacharias$sftm$Main$OnScrollMsg;
	}
};
var _ezacharias$sftm$Main$view = function (model) {
	var _p18 = model.page;
	switch (_p18.ctor) {
		case 'ListPage':
			return A2(
				_elm_lang$html$Html$map,
				_ezacharias$sftm$Main$listMsg,
				_ezacharias$sftm$Page_List$view(model.problems));
		case 'AboutPage':
			return A2(_ezacharias$sftm$Page_About$view, _ezacharias$sftm$Main$AboutBackButtonClickedMsg, _ezacharias$sftm$Main$version);
		case 'SolvePage':
			return A2(
				_elm_lang$html$Html$map,
				_ezacharias$sftm$Main$SolvePageMsg,
				A2(
					_ezacharias$sftm$Page_Solve$view,
					_ezacharias$sftm$Main$currentProblem(model),
					_p18._1));
		default:
			var _p19 = _p18._0;
			return A2(
				_ezacharias$sftm$Page_Proof$view,
				_ezacharias$sftm$Main$GoToProblemMsg(_p19.index),
				_p19);
	}
};
var _ezacharias$sftm$Main$LocalStorageChangedMsg = function (a) {
	return {ctor: 'LocalStorageChangedMsg', _0: a};
};
var _ezacharias$sftm$Main$subscriptions = function (model) {
	return _ezacharias$sftm$Ports$onLocalStorageChange(_ezacharias$sftm$Main$LocalStorageChangedMsg);
};
var _ezacharias$sftm$Main$IgnoreMsg = {ctor: 'IgnoreMsg'};
var _ezacharias$sftm$Main$rootLocation = F2(
	function (isInit, model) {
		var _p20 = model.page;
		if (_p20.ctor === 'ListPage') {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var newModel = _elm_lang$core$Native_Utils.update(
				model,
				{page: _ezacharias$sftm$Main$ListPage});
			return {
				ctor: '_Tuple2',
				_0: newModel,
				_1: _elm_lang$core$Platform_Cmd$batch(
					{
						ctor: '::',
						_0: A2(_ezacharias$sftm$Main$setPage, isInit, '/'),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Main$setLocalStorage(newModel),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Task$attempt,
									function (result) {
										return _ezacharias$sftm$Main$IgnoreMsg;
									},
									A2(_elm_lang$dom$Dom_Scroll$toY, 'scrolling', newModel.scrollY)),
								_1: {ctor: '[]'}
							}
						}
					})
			};
		}
	});
var _ezacharias$sftm$Main$problemLocation = F3(
	function (i, isInit, model) {
		var idx = i - 1;
		var isSame = function () {
			var _p21 = model.page;
			if (_p21.ctor === 'SolvePage') {
				return _elm_lang$core$Native_Utils.eq(idx, _p21._0);
			} else {
				return false;
			}
		}();
		if (isSame) {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var newModel = _elm_lang$core$Native_Utils.update(
				model,
				{
					page: A2(
						_ezacharias$sftm$Main$SolvePage,
						idx,
						A2(
							_ezacharias$sftm$Page_Solve$init,
							idx,
							A2(_ezacharias$sftm$Utilities$unsafeGet, idx, model.problems)))
				});
			return {
				ctor: '_Tuple2',
				_0: newModel,
				_1: _elm_lang$core$Platform_Cmd$batch(
					{
						ctor: '::',
						_0: A2(
							_ezacharias$sftm$Main$setPage,
							isInit,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'/problem-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(i),
									'/'))),
						_1: {
							ctor: '::',
							_0: _ezacharias$sftm$Main$setLocalStorage(newModel),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Task$attempt,
									function (result) {
										return _ezacharias$sftm$Main$IgnoreMsg;
									},
									A2(_elm_lang$dom$Dom_Scroll$toY, 'scrolling', 0.0)),
								_1: {ctor: '[]'}
							}
						}
					})
			};
		}
	});
var _ezacharias$sftm$Main$proofLocation = F3(
	function (i, isInit, model) {
		var idx = i - 1;
		var isSame = function () {
			var _p22 = model.page;
			if (_p22.ctor === 'ProofPage') {
				return _elm_lang$core$Native_Utils.eq(idx, _p22._0.index);
			} else {
				return false;
			}
		}();
		var problem = A2(_ezacharias$sftm$Utilities$unsafeGet, idx, model.problems);
		if (isSame) {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var _p23 = problem.proof;
			if (_p23.ctor === 'Just') {
				var proofModel = {name: problem.description, index: idx, start: problem.start, steps: _p23._0, rules: problem.rules};
				var newModel = _elm_lang$core$Native_Utils.update(
					model,
					{
						page: _ezacharias$sftm$Main$ProofPage(proofModel)
					});
				return {
					ctor: '_Tuple2',
					_0: newModel,
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A2(
								_ezacharias$sftm$Main$setPage,
								isInit,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'/problem-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(i),
										'/proof/'))),
							_1: {
								ctor: '::',
								_0: _ezacharias$sftm$Main$setLocalStorage(newModel),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Task$attempt,
										function (result) {
											return _ezacharias$sftm$Main$IgnoreMsg;
										},
										_elm_lang$dom$Dom_Scroll$toTop('scrolling')),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$core$Task$attempt,
											function (result) {
												return _ezacharias$sftm$Main$IgnoreMsg;
											},
											_elm_lang$dom$Dom_Scroll$toLeft('scrolling')),
										_1: {ctor: '[]'}
									}
								}
							}
						})
				};
			} else {
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(_ezacharias$sftm$Main$mainPath)
				};
			}
		}
	});
var _ezacharias$sftm$Main$paths = _elm_lang$core$Dict$fromList(
	A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: '/', _1: _ezacharias$sftm$Main$rootLocation},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: '/about/', _1: _ezacharias$sftm$Main$aboutLocation},
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$map,
				function (i) {
					return {
						ctor: '_Tuple2',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'/problem-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(i),
								'/')),
						_1: _ezacharias$sftm$Main$problemLocation(i)
					};
				},
				A2(
					_elm_lang$core$List$range,
					1,
					_elm_lang$core$List$length(_ezacharias$sftm$Problems$problems) + 1)),
			A2(
				_elm_lang$core$List$map,
				function (i) {
					return {
						ctor: '_Tuple2',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'/problem-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(i),
								'/proof/')),
						_1: _ezacharias$sftm$Main$proofLocation(i)
					};
				},
				A2(
					_elm_lang$core$List$range,
					1,
					_elm_lang$core$List$length(_ezacharias$sftm$Problems$problems) + 1)))));
var _ezacharias$sftm$Main$locationUpdate = F3(
	function (isInit, location, model) {
		var shortPath = location.pathname;
		var setLocalStorage = function (_p24) {
			return _ezacharias$sftm$Ports$setLocalStorage(
				_ezacharias$sftm$Main$encodeLocalStorage(_p24));
		};
		var setPage = isInit ? _ezacharias$sftm$Ports$setPage : function (ignore) {
			return _elm_lang$core$Platform_Cmd$none;
		};
		var _p25 = A2(_elm_lang$core$Dict$get, shortPath, _ezacharias$sftm$Main$paths);
		if (_p25.ctor === 'Nothing') {
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _elm_lang$navigation$Navigation$newUrl(_ezacharias$sftm$Main$mainPath)
			};
		} else {
			return A2(_p25._0, isInit, model);
		}
	});
var _ezacharias$sftm$Main$init = F2(
	function (flags, location) {
		var model = _ezacharias$sftm$Main$decodeModel(flags);
		var _p26 = A3(_ezacharias$sftm$Main$locationUpdate, false, location, model);
		var model2 = _p26._0;
		var cmd = _p26._1;
		return {
			ctor: '_Tuple2',
			_0: model2,
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: cmd,
					_1: {
						ctor: '::',
						_0: _ezacharias$sftm$Ports$initialize(
							{ctor: '_Tuple0'}),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _ezacharias$sftm$Main$update = F2(
	function (msg, model) {
		var _p27 = msg;
		switch (_p27.ctor) {
			case 'IgnoreMsg':
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'LocalStorageChangedMsg':
				var _p28 = _p27._0;
				if (_p28.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					var _p29 = A2(
						_elm_lang$core$Json_Decode$decodeString,
						_ezacharias$sftm$Main$decodeLocalStorage(model),
						_p28._0);
					if (_p29.ctor === 'Ok') {
						return {
							ctor: '_Tuple2',
							_0: A2(_ezacharias$sftm$Main$modelUpdated, _p29._0, model),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return A2(
							_elm_lang$core$Debug$log,
							_p29._0,
							{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
					}
				}
			case 'GoToProblemMsg':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(
						A2(
							_elm_lang$core$Basics_ops['++'],
							_ezacharias$sftm$Main$fullPath,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'/problem-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(1 + _p27._0),
									'/'))))
				};
			case 'GoToAboutMsg':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(
						A2(_elm_lang$core$Basics_ops['++'], _ezacharias$sftm$Main$fullPath, '/about/'))
				};
			case 'SolvePageMsg':
				var _p30 = A3(
					_ezacharias$sftm$Page_Solve$update,
					_ezacharias$sftm$Main$currentProblem(model),
					_p27._0,
					_ezacharias$sftm$Main$currentSolvePageModel(model));
				switch (_p30.ctor) {
					case 'UnchangedOutMsg':
						return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
					case 'ModelChangedOutMsg':
						var newModel = A2(_ezacharias$sftm$Main$setCurrentSolvePageModel, _p30._0, model);
						return {ctor: '_Tuple2', _0: newModel, _1: _elm_lang$core$Platform_Cmd$none};
					case 'ProblemChangedOutMsg':
						var newModel = A2(
							_ezacharias$sftm$Main$setCurrentSolvePageModel,
							_p30._1,
							A2(_ezacharias$sftm$Main$setCurrentProblem, _p30._0, model));
						return {
							ctor: '_Tuple2',
							_0: newModel,
							_1: _ezacharias$sftm$Ports$setLocalStorage(
								_ezacharias$sftm$Main$encodeLocalStorage(newModel))
						};
					case 'SolvedOutMsg':
						var _p35 = _p30._0;
						var _p34 = _p30._1;
						var isInitial = function () {
							var _p31 = _p34.proof;
							if (_p31.ctor === 'Nothing') {
								return true;
							} else {
								return false;
							}
						}();
						var index = _ezacharias$sftm$Main$problemIndex(model);
						var problem1 = _ezacharias$sftm$Problem$reset(_p34);
						var steps = function () {
							var _p32 = _p34.proof;
							if (_p32.ctor === 'Nothing') {
								return _p35;
							} else {
								var _p33 = _p32._0;
								return (_elm_lang$core$Native_Utils.cmp(
									_elm_lang$core$List$length(_p33),
									_elm_lang$core$List$length(_p35)) < 0) ? _p33 : _p35;
							}
						}();
						var problem2 = _elm_lang$core$Native_Utils.update(
							problem1,
							{
								proof: _elm_lang$core$Maybe$Just(steps)
							});
						var newModel1 = A2(_ezacharias$sftm$Main$setCurrentProblem, problem2, model);
						return {
							ctor: '_Tuple2',
							_0: newModel1,
							_1: _elm_lang$core$Platform_Cmd$batch(
								{
									ctor: '::',
									_0: _ezacharias$sftm$Ports$setLocalStorage(
										_ezacharias$sftm$Main$encodeLocalStorage(newModel1)),
									_1: {
										ctor: '::',
										_0: _ezacharias$sftm$Ports$problemSolved(
											{
												problemIndex: index,
												isInitial: isInitial,
												stepCount: _elm_lang$core$List$length(_p35)
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$navigation$Navigation$newUrl(_ezacharias$sftm$Main$mainPath),
											_1: {ctor: '[]'}
										}
									}
								})
						};
					case 'ModelCmdChangedOutMsg':
						var newModel = A2(_ezacharias$sftm$Main$setCurrentSolvePageModel, _p30._0, model);
						return {
							ctor: '_Tuple2',
							_0: newModel,
							_1: A2(_elm_lang$core$Platform_Cmd$map, _ezacharias$sftm$Main$SolvePageMsg, _p30._1)
						};
					case 'ExitOutMsg':
						return {
							ctor: '_Tuple2',
							_0: model,
							_1: _elm_lang$navigation$Navigation$newUrl(_ezacharias$sftm$Main$mainPath)
						};
					default:
						return {
							ctor: '_Tuple2',
							_0: model,
							_1: _elm_lang$navigation$Navigation$newUrl(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_ezacharias$sftm$Main$fullPath,
									A2(
										_elm_lang$core$Basics_ops['++'],
										'/problem-',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(
												_ezacharias$sftm$Main$problemIndex(model) + 1),
											'/proof/'))))
						};
				}
			case 'AboutBackButtonClickedMsg':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(_ezacharias$sftm$Main$mainPath)
				};
			case 'OnScrollMsg':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A2(
						_elm_lang$core$Task$attempt,
						function (_p36) {
							return A2(
								_elm_lang$core$Result$withDefault,
								_ezacharias$sftm$Main$IgnoreMsg,
								A2(_elm_lang$core$Result$map, _ezacharias$sftm$Main$SaveScrollMsg, _p36));
						},
						_elm_lang$dom$Dom_Scroll$y('scrolling'))
				};
			case 'SaveScrollMsg':
				var newModel = _elm_lang$core$Native_Utils.update(
					model,
					{scrollY: _p27._0});
				return {ctor: '_Tuple2', _0: newModel, _1: _elm_lang$core$Platform_Cmd$none};
			default:
				return A3(_ezacharias$sftm$Main$locationUpdate, true, _p27._0, model);
		}
	});
var _ezacharias$sftm$Main$main = A2(
	_elm_lang$navigation$Navigation$programWithFlags,
	_ezacharias$sftm$Main$LocationUpdateMsg,
	{subscriptions: _ezacharias$sftm$Main$subscriptions, init: _ezacharias$sftm$Main$init, view: _ezacharias$sftm$Main$view, update: _ezacharias$sftm$Main$update})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (local) {
			return _elm_lang$core$Json_Decode$succeed(
				{local: local});
		},
		A2(
			_elm_lang$core$Json_Decode$field,
			'local',
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _ezacharias$sftm$Main$main !== 'undefined') {
    _ezacharias$sftm$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

(function() {

    var run = function() {
        (function() {
            'use strict';

            var svgns = 'http://www.w3.org/2000/svg';
            var s = document.getElementById('glyphs');
            var e;

            // Comma
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJMAIN-2C';
            e.setAttributeNS(null, 'd', 'M78 35T78 60T94 103T137 121Q165 121 187 96T210 8Q210 -27 201 -60T180 -117T154 -158T130 -185T117 -194Q113 -194 104 -185T95 -172Q95 -168 106 -156T131 -126T157 -76T173 -3V9L172 8Q170 7 167 6T161 3T152 1T140 0Q113 0 96 17Z');
            s.appendChild(e);

            // Latin A
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJMATHI-41';
            e.setAttributeNS(null, 'd', 'M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z');
            s.appendChild(e);

            // Latin B
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJMATHI-42';
            e.setAttributeNS(null, 'd', 'M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z');
            s.appendChild(e);

            // Latin C
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJMATHI-43';
            e.setAttributeNS(null, 'd', 'M50 252Q50 367 117 473T286 641T490 704Q580 704 633 653Q642 643 648 636T656 626L657 623Q660 623 684 649Q691 655 699 663T715 679T725 690L740 705H746Q760 705 760 698Q760 694 728 561Q692 422 692 421Q690 416 687 415T669 413H653Q647 419 647 422Q647 423 648 429T650 449T651 481Q651 552 619 605T510 659Q484 659 454 652T382 628T299 572T226 479Q194 422 175 346T156 222Q156 108 232 58Q280 24 350 24Q441 24 512 92T606 240Q610 253 612 255T628 257Q648 257 648 248Q648 243 647 239Q618 132 523 55T319 -22Q206 -22 128 53T50 252Z');
            s.appendChild(e);

            // Star
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJAMS-2605';
            e.setAttributeNS(null, 'd', 'M367 395Q374 416 398 492T442 627T463 688Q463 692 467 692Q471 694 472 694Q478 694 484 680T523 562Q553 469 576 400L577 395H731H819Q872 395 883 394T895 384Q895 380 891 376T832 333Q794 305 767 285Q643 195 643 194L690 47Q737 -96 737 -103Q737 -111 727 -111Q721 -111 594 -18L472 71L350 -18Q223 -111 217 -111Q207 -111 207 -103Q207 -96 254 47L301 194Q301 195 241 239T118 328T51 378Q49 382 49 384Q49 392 58 393T110 395H213H367Z');
            s.appendChild(e);

            // Fraktur A
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJFRAK-41';
            e.setAttributeNS(null, 'd', 'M22 505Q22 563 94 624T271 685H280Q416 685 443 560Q447 535 447 504Q444 414 405 330L399 319L229 155Q233 154 241 153T253 150T265 145T281 135T301 119T328 93L357 64L402 92Q438 116 473 137L500 154V339Q500 528 495 593V601L559 649Q621 696 624 696L638 686L629 677Q599 650 593 638Q582 614 581 504Q580 490 580 443Q580 314 584 238Q584 235 584 224T584 210T585 199T586 187T588 176T591 164T595 152T601 137T609 121Q630 77 640 77Q661 77 703 101Q704 95 706 90L707 86V84L636 29Q618 15 601 2T574 -19T564 -25L500 121Q499 121 399 48L299 -26Q298 -26 291 -15T272 11T245 42T209 69T165 80Q120 80 58 43L48 37L40 42L32 48L122 117Q196 173 241 211Q319 280 343 327T368 447Q368 535 317 582Q264 633 199 633Q155 633 122 605T86 542Q86 518 133 467T181 387Q181 348 140 309Q113 281 73 260L64 255L50 265L59 273Q112 307 112 345Q112 363 90 387T45 441T22 505Z');
            s.appendChild(e);

            // Fraktur B
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJFRAK-42';
            e.setAttributeNS(null, 'd', 'M48 506Q48 568 120 629T268 691Q362 691 425 594L431 585L441 594Q478 628 528 657T629 686Q665 686 687 670Q703 658 718 584T753 506Q756 505 763 505Q778 505 804 512L815 516L820 496Q820 494 808 490T774 476T732 454Q720 445 708 437L675 415L640 394L625 383Q626 382 635 382Q652 382 670 379T712 364T754 336T784 289T797 220Q797 172 776 122Q769 106 766 102T745 84Q654 11 619 -8T538 -27Q483 -27 387 10T249 47Q218 47 186 34T133 8T112 -5T104 7T97 21L196 82Q259 120 284 140Q333 181 351 214Q368 251 368 353Q368 588 228 620Q222 621 205 621Q160 621 139 596Q117 569 117 548Q117 526 162 470T208 387Q208 352 179 320T104 264Q88 256 86 256Q83 256 70 266L82 274Q134 309 134 343Q134 352 130 359Q118 377 100 401T72 439T56 470T48 506ZM453 528Q457 496 457 419L458 357L488 367Q554 390 622 425Q673 449 673 453L671 454Q669 456 665 460T657 473T648 498T639 541Q629 597 616 613Q599 633 567 633Q534 633 493 599Q471 577 457 540L453 528ZM713 176Q713 252 661 295T528 339Q512 339 494 336T466 330T455 325Q454 325 452 311T444 270T425 217L420 207L304 118L319 116Q381 111 475 74T602 37Q655 37 684 79T713 176Z');
            s.appendChild(e);

            // Fraktur C
            e = document.createElementNS(svgns, 'path');
            e.id = 'MJFRAK-43';
            e.setAttributeNS(null, 'd', 'M299 585Q333 609 384 634T470 672L505 685Q506 685 513 662T531 613T548 580Q553 576 563 576Q575 576 605 585Q607 585 607 575V564Q537 532 496 527Q475 542 456 567T427 610T415 627Q410 627 398 618T382 603Q373 588 373 558T386 475T400 399Q400 337 366 303Q343 281 309 266T254 247T226 242L214 257Q214 258 223 260T251 272T287 299Q304 316 304 360Q304 396 289 451T274 532Q274 553 277 561V564H269Q205 558 172 501T139 358Q139 207 226 127T443 46Q448 46 457 46T470 47L485 48L601 106Q602 106 602 93V80Q551 48 517 25T474 -4T460 -13T443 -19Q409 -24 367 -24Q360 -24 351 -24T335 -23T326 -22Q190 -2 125 87T59 319V328Q62 412 96 487L101 500L118 512Q189 563 245 591L266 601L299 585Z');
            s.appendChild(e);
        }());

        document.body.addEventListener('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp;
            var t1 = e.currentTarget.dataset.lastTouch || t2;
            var dt = t2 - t1;
            var fingers = e.touches.length;
            e.currentTarget.dataset.lastTouch = t2;

            if (!dt || dt > 500 || fingers > 1) return; // not double-tap

            e.preventDefault();
            e.target.click();
        });

        (function() {
            'use strict';

            var key = 'book-prop-v1';
            var app = Elm.Main.embed(document.getElementById('elm-content-frame'), {
                local: localStorage.getItem(key) || null
            });
            app.ports.initialize.subscribe(function(ignore) {
                schStartHereClicked = function() {
                    ga('send', 'event', 'Main', 'Start');
                    document.getElementById('initial-content-frame').remove();
                    document.getElementById('elm-content-frame').style.display = null;
                };
                if (schIsDocumentLoaded) {
                    schStartHereClicked();
                }
            });
            app.ports.sendEvent.subscribe(function(value) {
                // ga('send', 'event', 'Problem ' + (value.index + 1), 'Solved', value.label, value.steps);
                ga('send', 'event', value.category, value.action, value.label);
            });
            app.ports.setPage.subscribe(function(pathname) {
                ga('set', 'page', pathname);
                ga('send', 'pageview');
            });
            app.ports.setLocalStorage.subscribe(function(value) {
                try {
                    localStorage.setItem(key, value);
                } catch (err) {}
            });
            window.addEventListener('storage', function(event) {
                if (event.storageArea === localStorage && event.key === key) {
                    app.ports.onLocalStorageChange.send(event.newValue);
                }
            }, false);
            app.ports.copy.subscribe(function(text) {
                var textArea = document.createElement('textarea');
                textArea.style.position = 'fixed';
                textArea.style.top = 0;
                textArea.style.left = 0;
                textArea.style.width = '2em';
                textArea.style.height = '2em';
                textArea.style.padding = 0;
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';
                textArea.style.background = 'transparent';
                textArea.value = text;
                document.body.appendChild(textArea);

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    var editable = textArea.contentEditable;
                    var readOnly = textArea.readOnly;
                    textArea.contentEditable = true;
                    textArea.readOnly = false;
                    var range = document.createRange();
                    range.selectNodeContents(textArea);
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                    textArea.contentEditable = editable;
                    textArea.readOnly = readOnly;
                } else {
                    textArea.select();
                }
                try {
                    var successful = document.execCommand('copy');
                } catch (err) {
                    console.log('Oops, unable to copy');
                }
                document.body.removeChild(textArea);
            });
        }());
    };

    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
}());
