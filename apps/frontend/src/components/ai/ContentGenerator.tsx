'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  Copy
} from 'lucide-react';
import Button from '@/components/ui/Button';

type ToneOption = 'formal' | 'casual' | 'simplified';
type ContentType = 'assignment' | 'examples' | 'summary';

interface GeneratedContent {
  type: ContentType;
  title: string;
  content: string;
  tone: ToneOption;
}

interface ContentGeneratorProps {
  courseId?: string;
  moduleId?: string;
  onSave?: (content: GeneratedContent) => void;
}

const MOCK_ASSIGNMENT_FORMAL = `## Assignment: JavaScript Fundamentals Review

### Instructions
Complete the following exercises to demonstrate your understanding of JavaScript fundamentals.

### Part A: Variables and Data Types (20 points)
1. Declare a variable using let and assign it a string value.
2. Create a constant using const for an array of numbers.
3. Explain the difference between var, let, and const.

### Part B: Functions (30 points)
1. Write a function that takes two parameters and returns their sum.
2. Create an arrow function that calculates the square of a number.
3. Implement a function using default parameters.

### Part C: Arrays and Objects (30 points)
1. Create an array and use three different array methods (map, filter, reduce).
2. Create an object with at least 4 properties.
3. Destructure an object and log the values.

### Part D: Async JavaScript (20 points)
1. Explain the difference between callbacks, promises, and async/await.
2. Write an async function that fetches data from an API.

### Submission Guidelines
- Submit your code as a single JavaScript file
- Include comments explaining your logic
- Due: Next Friday at 11:59 PM`;

const MOCK_ASSIGNMENT_CASUAL = `## Hey there! Let's practice JavaScript!

### What's the Deal?
You've learned some cool stuff about JavaScript. Now it's time to put it to the test!

### Task 1: Variables are Fun! (10 mins)
- Create a variable for your name
- Create a constant for your favorite number
- Don't forget: const can't be changed, but let can!

### Task 2: Functions are Your Superpower (15 mins)
- Build a function that says hello to anyone!
- Try making an arrow function
- Make it return something cool

### Task 3: Array Adventures! (15 mins)
- Make an array of your favorite foods
- Use .map() to make them all uppercase
- Use .filter() to pick just one
- Use .reduce() to count something

### Task 4: Objects - Like Real Objects! (10 mins)
- Create an object for yourself (name, age, hobby)
- Pull out the info using destructuring

### Bonus Challenge!
Try the async/await part if you're feeling brave!

### Questions?
Drop them in the discussion forum. Let's learn together!`;

const MOCK_ASSIGNMENT_SIMPLIFIED = `## JavaScript Quiz - Easy Version

### Question 1: Variables
What will this code print?
let name = "Alice";
console.log(name);
a) error
b) Alice
c) undefined

### Question 2: Arrays
How do you add "banana" to this array?
let fruits = ["apple", "orange"];
a) fruits.add("banana")
b) fruits.push("banana")
c) fruits + "banana"

### Question 3: Functions
What does this function return?
function add(a, b) { return a + b; }
add(2, 3);
a) 2
b) 5
c) undefined

### Question 4: Loops
Which loop runs 5 times?
a) for (let i = 0; i < 3; i++)
b) for (let i = 0; i < 5; i++)
c) for (let i = 0; i < 7; i++)

Good luck!`;

const MOCK_EXAMPLES_FORMAL = `## Code Examples: JavaScript Fundamentals

### 1. Variable Declarations

// Using let - can be reassigned
let userName = "John Doe";
userName = "Jane Doe"; // Valid

// Using const - cannot be reassigned
const PI = 3.14159;

// Using var - function-scoped
var oldStyle = "deprecated";

### 2. Function Types

// Function Declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function Expression
const greetExpr = function(name) {
  return "Hello, " + name + "!";
};

// Arrow Function
const greetArrow = (name) => "Hello, " + name + "!";

### 3. Array Methods

const numbers = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = numbers.map(n => n * 2);
// Result: [2, 4, 6, 8, 10]

// filter - keep elements that pass test
const evens = numbers.filter(n => n % 2 === 0);
// Result: [2, 4]

// reduce - combine elements into single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
// Result: 15

### 4. Object Operations

const student = {
  name: "Alice",
  age: 20,
  grade: "A",
  subjects: ["Math", "Science"]
};

// Property access
console.log(student.name); // "Alice"

// Destructuring
const { name, age } = student;`;

const MOCK_EXAMPLES_CASUAL = `## Let's See Some Code!

### Example 1: Your First Variables

// This is how you store stuff!
let myName = "Sarah";
const myAge = 25;

console.log("Hi! I'm " + myName);
console.log("I'm " + myAge + " years old");

### Example 2: Making Functions

// Old way
function sayHi(name) {
  return "Hey " + name + "!";
}

// Arrow function
const sayHey = (name) => {
  return "Hey " + name + "!";
};

// Even shorter!
const sayYo = name => "Yo " + name + "!";

console.log(sayHi("Alex")); // Hey Alex!
console.log(sayYo("Sam"));  // Yo Sam!

### Example 3: Arrays Are Fun!

const colors = ["red", "blue", "green"];

// Add something
colors.push("yellow");

// Make everything uppercase
const loudColors = colors.map(color => color.toUpperCase());

// Find something
const found = colors.find(color => color === "blue");

### Example 4: Objects

const myDog = {
  name: "Buddy",
  age: 3,
  breed: "Golden Retriever"
};

console.log(myDog.name); // Buddy

// Easy destructuring!
const { name, age } = myDog;`;

const MOCK_EXAMPLES_SIMPLIFIED = `## JavaScript Examples with Pictures!

### Variables = Boxes

let name = "Pizza";  // A box called "name"
let slices = 8;     // A box called "slices"

### Functions = Machines

function makePizza() {
  return "Pizza!";
}

### Arrays = Lists

let fruits = ["apple", "banana", "orange"];

fruits[0]  // apple
fruits[1]  // banana

### Loops = Repeating!

for (let i = 1; i <= 3; i++) {
  console.log("Hello " + i);
}

Output:
Hello 1
Hello 2
Hello 3

### Objects = Character Sheets

let hero = {
  name: "Mario",
  job: "Plumber",
  power: "Jump"
};

hero.name  // "Mario"

Happy coding!`;

const MOCK_SUMMARY_FORMAL = `## Summary: JavaScript Fundamentals

### Overview
This lecture covered the essential building blocks of JavaScript programming, including variables, data types, functions, and control flow structures.

### Key Concepts

#### 1. Variables and Data Types
- Primitive Types: String, Number, Boolean, Null, Undefined
- Variable Declarations: let, const, var

#### 2. Functions
- Function Declarations: Hoisted, can be called before definition
- Function Expressions: Assigned to variables, not hoisted
- Arrow Functions: Concise syntax, lexical 'this'

#### 3. Control Flow
- Conditional Statements: if/else, switch, ternary operator
- Loops: for, while, do-while, for-of, for-in
- Error Handling: try/catch/finally

#### 4. Arrays
- Methods: map(), filter(), reduce(), find(), forEach()
- Immutability: Prefer methods that return new arrays

### Learning Objectives
By the end of this lecture, students should be able to:
1. Declare and use variables appropriately
2. Create and invoke functions using various syntaxes
3. Implement conditional logic and loops
4. Manipulate arrays using built-in methods

### Assessment
Complete the assignment by next week to reinforce these concepts.`;

const MOCK_SUMMARY_CASUAL = `## What We Learned Today!

### What Did We Cover?

Today we learned the building blocks of JavaScript!

---

### Variables: Storing Stuff

let name = "Alex";
const pi = 3.14;

### Functions: Doing Stuff

// Regular function
function greet(name) {
  return "Hey " + name;
}

// Arrow function (shorter!)
const greet = (name) => "Hey " + name;

### Arrays: Lists of Things

let colors = ["red", "blue", "green"];

colors.map(c => c.toUpperCase());
colors.filter(c => c !== "red");

### Objects: Packages

let cat = {
  name: "Whiskers",
  age: 3,
  meow: () => "Meow!"
};

console.log(cat.name);

---

### The Big Ideas

1. Variables hold data - Like labeled boxes
2. Functions do work - Like tiny machines
3. Arrays hold lists - Like numbered lists
4. Objects group data - Like forms with fields

### Next Time
We'll dive into more complex functions and building projects!`;

const MOCK_SUMMARY_SIMPLIFIED = `## JavaScript Basics - Quick Summary

### Variables (Hold Information)

let age = 15;
const name = "Tom";

### Functions (Do Things)

function sayHi() {
  console.log("Hi!");
}

sayHi();

### Arrays (Make Lists)

let nums = [1, 2, 3];

nums.push(4);
nums[0];

### If/Else (Make Choices)

if (age > 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}

### Loops (Repeat)

for (let i = 0; i < 3; i++) {
  console.log(i);
}

### Remember!

- Variables: let and const
- Functions: function or () =>
- Arrays: [] with . and [ access
- If/Else: Make decisions
- Loops: Repeat code

You Can Do This!`;

const MOCK_RESPONSES: Record<ContentType, Record<ToneOption, { title: string; content: string }>> = {
  assignment: {
    formal: { title: 'Advanced JavaScript Programming Assignment', content: MOCK_ASSIGNMENT_FORMAL },
    casual: { title: 'JavaScript Practice Time!', content: MOCK_ASSIGNMENT_CASUAL },
    simplified: { title: 'JavaScript Basics Quiz', content: MOCK_ASSIGNMENT_SIMPLIFIED },
  },
  examples: {
    formal: { title: 'Code Examples: JavaScript Fundamentals', content: MOCK_EXAMPLES_FORMAL },
    casual: { title: 'Code Examples - Super Simple Edition!', content: MOCK_EXAMPLES_CASUAL },
    simplified: { title: 'Code Examples - Visual Guide', content: MOCK_EXAMPLES_SIMPLIFIED },
  },
  summary: {
    formal: { title: 'Lecture Summary: JavaScript Fundamentals', content: MOCK_SUMMARY_FORMAL },
    casual: { title: 'What We Learned Today!', content: MOCK_SUMMARY_CASUAL },
    simplified: { title: 'JavaScript Basics - Quick Summary', content: MOCK_SUMMARY_SIMPLIFIED },
  },
};

export default function ContentGenerator({ courseId, moduleId, onSave }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>('assignment');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ToneOption>('formal');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or description');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResponse = MOCK_RESPONSES[contentType][tone];
      
      const content: GeneratedContent = {
        type: contentType,
        title: mockResponse.title,
        content: mockResponse.content,
        tone,
      };

      setGeneratedContent(content);
      setEditingContent(content.content);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editingContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave && generatedContent) {
      onSave({
        ...generatedContent,
        content: editingContent,
      });
    }
    setShowPreview(false);
  };

  const handleEdit = () => {
    if (generatedContent) {
      setEditingContent(generatedContent.content);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you want to generate?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'assignment', label: 'Assignment', icon: FileText },
            { id: 'examples', label: 'Examples', icon: BookOpen },
            { id: 'summary', label: 'Summary', icon: Sparkles },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setContentType(item.id as ContentType)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                contentType === item.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic or Lesson Description
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`Describe the topic for ${contentType} generation...`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Writing Tone
        </label>
        <div className="flex gap-3">
          {[
            { id: 'formal', label: 'Formal', desc: 'Professional & Academic' },
            { id: 'casual', label: 'Casual', desc: 'Friendly & Conversational' },
            { id: 'simplified', label: 'Simplified', desc: 'Easy & Visual' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTone(item.id as ToneOption)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                tone === item.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${tone === item.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                {item.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating {contentType === 'examples' ? 'examples' : contentType}...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </>
        )}
      </Button>

      {showPreview && generatedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{generatedContent.title}</h3>
                <p className="text-sm text-gray-500">
                  {contentType.charAt(0).toUpperCase() + contentType.slice(1)} - {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
