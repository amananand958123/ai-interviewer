import { geminiService } from '../services/geminiService'

export interface Question {
  id: number
  text: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  expectedPoints: string[]
  techStack: string
}

<<<<<<< HEAD
export const allQuestionBank: Record<string, Question[]> = {
=======
export const questionBank: Record<string, Question[]> = {
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
  'Generic': [
    {
      id: 1,
      text: "Explain the difference between time complexity and space complexity. Provide examples.",
      category: "Algorithm Analysis",
      difficulty: "Easy",
      expectedPoints: [
        "Time complexity measures execution time",
        "Space complexity measures memory usage",
        "Big O notation usage",
        "Trade-offs between time and space"
      ],
      techStack: "Generic"
    },
    {
      id: 2,
      text: "What is the difference between a stack and a queue? When would you use each?",
      category: "Data Structures",
      difficulty: "Easy",
      expectedPoints: [
        "Stack: LIFO (Last In, First Out)",
        "Queue: FIFO (First In, First Out)",
        "Stack use cases: function calls, undo operations",
        "Queue use cases: task scheduling, breadth-first search"
      ],
      techStack: "Generic"
    },
    {
      id: 3,
      text: "Explain different sorting algorithms and their time complexities.",
      category: "Algorithms",
      difficulty: "Medium",
      expectedPoints: [
        "Bubble sort O(n²)",
        "Quick sort O(n log n) average",
        "Merge sort O(n log n) guaranteed",
        "When to use each algorithm"
      ],
      techStack: "Generic"
    },
    {
      id: 4,
      text: "What is recursion and how does it differ from iteration? What are the trade-offs?",
      category: "Programming Concepts",
      difficulty: "Medium",
      expectedPoints: [
        "Recursion calls itself",
        "Base case importance",
        "Stack memory usage",
        "Performance vs readability trade-offs"
      ],
      techStack: "Generic"
    },
    {
      id: 5,
      text: "Explain the concept of dynamic programming with an example.",
      category: "Advanced Algorithms",
      difficulty: "Hard",
      expectedPoints: [
        "Overlapping subproblems",
        "Optimal substructure",
        "Memoization vs tabulation",
        "Classic examples: Fibonacci, knapsack"
      ],
      techStack: "Generic"
    },
    {
      id: 6,
      text: "What are the differences between arrays and linked lists? When would you choose one over the other?",
      category: "Data Structures",
      difficulty: "Easy",
      expectedPoints: [
        "Memory allocation differences",
        "Access time: O(1) vs O(n)",
        "Insertion/deletion complexity",
        "Cache locality considerations"
      ],
      techStack: "Generic"
    },
    {
      id: 7,
      text: "Explain graph traversal algorithms: BFS vs DFS.",
      category: "Graph Algorithms",
      difficulty: "Medium",
      expectedPoints: [
        "BFS uses queue",
        "DFS uses stack/recursion",
        "Level-order vs depth-first exploration",
        "Use cases for each approach"
      ],
      techStack: "Generic"
    },
    {
      id: 8,
      text: "What is a hash table and how does it achieve O(1) average case lookup?",
      category: "Data Structures",
      difficulty: "Medium",
      expectedPoints: [
        "Hash function concept",
        "Collision handling strategies",
        "Load factor importance",
        "Worst case O(n) scenario"
      ],
      techStack: "Generic"
    },
    {
      id: 9,
      text: "Explain the principles of object-oriented programming.",
      category: "Programming Paradigms",
      difficulty: "Easy",
      expectedPoints: [
        "Encapsulation",
        "Inheritance",
        "Polymorphism",
        "Abstraction"
      ],
      techStack: "Generic"
    },
    {
      id: 10,
      text: "What are design patterns and can you explain a few common ones?",
      category: "Software Design",
      difficulty: "Hard",
      expectedPoints: [
        "Reusable solutions to common problems",
        "Singleton pattern",
        "Observer pattern",
        "Factory pattern"
      ],
      techStack: "Generic"
    }
  ],
  'JavaScript': [
    {
      id: 1,
      text: "Explain the difference between let, const, and var in JavaScript.",
      category: "JavaScript Fundamentals",
      difficulty: "Easy",
      expectedPoints: [
        "Scope differences (block vs function)",
        "Hoisting behavior",
        "Reassignment capabilities",
        "Temporal dead zone for let/const"
      ],
      techStack: "JavaScript"
    },
    {
      id: 2,
      text: "What is event delegation in JavaScript and why is it useful?",
      category: "DOM Manipulation",
      difficulty: "Medium",
      expectedPoints: [
        "Event bubbling concept",
        "Performance benefits",
        "Dynamic content handling",
        "Single event listener pattern"
      ],
      techStack: "JavaScript"
    },
    {
      id: 3,
      text: "Explain the concept of closures in JavaScript with an example.",
      category: "Advanced JavaScript",
      difficulty: "Hard",
      expectedPoints: [
        "Lexical scoping",
        "Function returning function",
        "Variable persistence",
        "Practical use cases"
      ],
      techStack: "JavaScript"
    },
    {
      id: 4,
      text: "What are Promises and how do they differ from callbacks?",
      category: "Asynchronous JavaScript",
      difficulty: "Medium",
      expectedPoints: [
        "Promise states (pending, fulfilled, rejected)",
        "Avoiding callback hell",
        "Better error handling",
        "Chaining with .then() and .catch()"
      ],
      techStack: "JavaScript"
    },
    {
      id: 5,
      text: "Explain the difference between == and === in JavaScript.",
      category: "JavaScript Fundamentals",
      difficulty: "Easy",
      expectedPoints: [
        "Type coercion with ==",
        "Strict equality with ===",
        "Performance considerations",
        "Best practices"
      ],
      techStack: "JavaScript"
    }
  ],
  'React': [
    {
      id: 6,
      text: "What is the Virtual DOM and how does React use it?",
      category: "React Core Concepts",
      difficulty: "Medium",
      expectedPoints: [
        "Virtual DOM representation",
        "Diffing algorithm",
        "Performance benefits",
        "Reconciliation process"
      ],
      techStack: "React"
    },
    {
      id: 7,
      text: "Explain the difference between functional and class components.",
      category: "React Components",
      difficulty: "Easy",
      expectedPoints: [
        "Syntax differences",
        "State management approaches",
        "Lifecycle methods vs hooks",
        "Performance considerations"
      ],
      techStack: "React"
    },
    {
      id: 8,
      text: "What are React Hooks and why were they introduced?",
      category: "React Hooks",
      difficulty: "Medium",
      expectedPoints: [
        "State management in functional components",
        "Reusing stateful logic",
        "Lifecycle methods replacement",
        "Common hooks (useState, useEffect, useContext)"
      ],
      techStack: "React"
    },
    {
      id: 9,
      text: "Explain React's reconciliation algorithm and keys.",
      category: "React Performance",
      difficulty: "Hard",
      expectedPoints: [
        "Tree diffing algorithm",
        "Key prop importance",
        "List rendering optimization",
        "Component rerendering rules"
      ],
      techStack: "React"
    },
    {
      id: 10,
      text: "What is prop drilling and how can you avoid it?",
      category: "React State Management",
      difficulty: "Medium",
      expectedPoints: [
        "Passing props through multiple levels",
        "Context API solution",
        "State management libraries",
        "Component composition patterns"
      ],
      techStack: "React"
    }
  ],
  'Python': [
    {
      id: 11,
      text: "Explain the difference between lists and tuples in Python.",
      category: "Python Data Structures",
      difficulty: "Easy",
      expectedPoints: [
        "Mutability differences",
        "Performance considerations",
        "Use cases for each",
        "Memory efficiency"
      ],
      techStack: "Python"
    },
    {
      id: 12,
      text: "What are Python decorators and how do they work?",
      category: "Python Advanced Features",
      difficulty: "Hard",
      expectedPoints: [
        "Function as first-class objects",
        "Wrapper function concept",
        "@ syntax sugar",
        "Common decorator examples"
      ],
      techStack: "Python"
    },
    {
      id: 13,
      text: "Explain Python's GIL (Global Interpreter Lock).",
      category: "Python Internals",
      difficulty: "Hard",
      expectedPoints: [
        "Thread safety mechanism",
        "Impact on multithreading",
        "Why it exists",
        "Alternatives and workarounds"
      ],
      techStack: "Python"
    },
    {
      id: 14,
      text: "What is the difference between deep copy and shallow copy?",
      category: "Python Memory Management",
      difficulty: "Medium",
      expectedPoints: [
        "Reference vs value copying",
        "Nested object behavior",
        "copy.copy() vs copy.deepcopy()",
        "Performance implications"
      ],
      techStack: "Python"
    },
    {
      id: 15,
      text: "Explain list comprehensions and their benefits.",
      category: "Python Syntax",
      difficulty: "Easy",
      expectedPoints: [
        "Concise syntax for creating lists",
        "Performance benefits over loops",
        "Conditional logic in comprehensions",
        "Dictionary and set comprehensions"
      ],
      techStack: "Python"
    }
  ],
  'Node.js': [
    {
      id: 16,
      text: "What is the Event Loop in Node.js and how does it work?",
      category: "Node.js Core Concepts",
      difficulty: "Hard",
      expectedPoints: [
        "Single-threaded event-driven architecture",
        "Call stack, callback queue, event loop",
        "Non-blocking I/O operations",
        "Phases of the event loop"
      ],
      techStack: "Node.js"
    },
    {
      id: 17,
      text: "Explain the difference between require() and import in Node.js.",
      category: "Node.js Modules",
      difficulty: "Medium",
      expectedPoints: [
        "CommonJS vs ES6 modules",
        "Synchronous vs asynchronous loading",
        "File extension requirements",
        "Compilation differences"
      ],
      techStack: "Node.js"
    },
    {
      id: 18,
      text: "What are streams in Node.js and when would you use them?",
      category: "Node.js Streams",
      difficulty: "Medium",
      expectedPoints: [
        "Types of streams (readable, writable, duplex)",
        "Memory efficiency for large data",
        "Pipe method for chaining",
        "Backpressure handling"
      ],
      techStack: "Node.js"
    },
    {
      id: 19,
      text: "How does Node.js handle child processes?",
      category: "Node.js Process Management",
      difficulty: "Hard",
      expectedPoints: [
        "child_process module",
        "spawn, exec, fork methods",
        "Communication between processes",
        "Use cases for child processes"
      ],
      techStack: "Node.js"
    },
    {
      id: 20,
      text: "What is middleware in Express.js?",
      category: "Node.js Frameworks",
      difficulty: "Easy",
      expectedPoints: [
        "Function execution during request/response cycle",
        "next() function usage",
        "Order of middleware execution",
        "Common middleware examples"
      ],
      techStack: "Node.js"
    }
  ],
  'Java': [
    {
      id: 21,
      text: "Explain the difference between JDK, JRE, and JVM.",
      category: "Java Platform",
      difficulty: "Easy",
      expectedPoints: [
        "JVM executes bytecode",
        "JRE provides runtime environment",
        "JDK includes development tools",
        "Relationship between the three"
      ],
      techStack: "Java"
    },
    {
      id: 22,
      text: "What is the difference between abstract classes and interfaces?",
      category: "Java OOP",
      difficulty: "Medium",
      expectedPoints: [
        "Abstract classes can have implementation",
        "Interfaces define contracts",
        "Multiple inheritance with interfaces",
        "When to use each"
      ],
      techStack: "Java"
    },
    {
      id: 23,
      text: "Explain Java's garbage collection mechanism.",
      category: "Java Memory Management",
      difficulty: "Hard",
      expectedPoints: [
        "Automatic memory management",
        "Different GC algorithms",
        "Heap structure (young, old generation)",
        "Tuning garbage collection"
      ],
      techStack: "Java"
    },
    {
      id: 24,
      text: "What are the principles of Object-Oriented Programming?",
      category: "Java OOP",
      difficulty: "Medium",
      expectedPoints: [
        "Encapsulation",
        "Inheritance",
        "Polymorphism",
        "Abstraction"
      ],
      techStack: "Java"
    },
    {
      id: 25,
      text: "Explain the difference between ArrayList and LinkedList.",
      category: "Java Collections",
      difficulty: "Easy",
      expectedPoints: [
        "Underlying data structure",
        "Performance characteristics",
        "Memory usage",
        "Use case scenarios"
      ],
      techStack: "Java"
    }
  ]
}

export const codingChallenges: Record<string, Array<{
  id: number
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  techStack: string
  starterCode: string
  testCases: Array<{
    input: any
    expectedOutput: any
    description: string
  }>
}>> = {
  'Generic': [
    {
      id: 1,
      title: "Two Sum Problem",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      difficulty: "Easy",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// You can use any programming language\n\n// Example:\n// Input: nums = [2,7,11,15], target = 9\n// Output: [0,1] (because nums[0] + nums[1] == 9)",
      testCases: [
        {
          input: { nums: [2, 7, 11, 15], target: 9 },
          expectedOutput: [0, 1],
          description: "Basic case with target sum at beginning"
        },
        {
          input: { nums: [3, 2, 4], target: 6 },
          expectedOutput: [1, 2],
          description: "Target sum at end of array"
        }
      ]
    },
    {
      id: 2,
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets in the correct order.",
      difficulty: "Easy",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Hint: Think about using a stack data structure\n\n// Example:\n// Input: s = \"()[]{}\"\n// Output: true",
      testCases: [
        {
          input: "()[]{}",
          expectedOutput: true,
          description: "Valid parentheses in order"
        },
        {
          input: "([)]",
          expectedOutput: false,
          description: "Invalid interleaved parentheses"
        }
      ]
    },
    {
      id: 3,
      title: "Binary Tree Maximum Depth",
      description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
      difficulty: "Easy",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Tree node structure (adapt to your language):\n// class TreeNode {\n//     val: number\n//     left: TreeNode | null\n//     right: TreeNode | null\n// }",
      testCases: [
        {
          input: { tree: [3, 9, 20, null, null, 15, 7] },
          expectedOutput: 3,
          description: "Binary tree with depth 3"
        }
      ]
    },
    {
      id: 4,
      title: "Merge Two Sorted Arrays",
      description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array. The final sorted array should be stored inside nums1.",
      difficulty: "Easy",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Note: nums1 has extra space at the end for nums2 elements\n\n// Example:\n// Input: nums1 = [1,2,3,0,0,0], nums2 = [2,5,6]\n// Output: nums1 = [1,2,2,3,5,6]",
      testCases: [
        {
          input: { nums1: [1, 2, 3, 0, 0, 0], nums2: [2, 5, 6] },
          expectedOutput: [1, 2, 2, 3, 5, 6],
          description: "Merge two sorted arrays"
        }
      ]
    },
    {
      id: 5,
      title: "Longest Common Subsequence",
      description: "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.",
      difficulty: "Medium",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Hint: This is a classic dynamic programming problem\n\n// Example:\n// Input: text1 = \"abcde\", text2 = \"ace\"\n// Output: 3 (the LCS is \"ace\")",
      testCases: [
        {
          input: { text1: "abcde", text2: "ace" },
          expectedOutput: 3,
          description: "LCS of 'abcde' and 'ace' is 'ace'"
        },
        {
          input: { text1: "abc", text2: "def" },
          expectedOutput: 0,
          description: "No common subsequence"
        }
      ]
    },
    {
      id: 6,
      title: "Implement Queue using Stacks",
      description: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should have all functions of a normal queue (push, pop, peek, empty).",
      difficulty: "Easy",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Use two stacks to simulate queue behavior\n\n// Operations to implement:\n// - push(x): Push element x to the back of queue\n// - pop(): Remove element from front of queue\n// - peek(): Get the front element\n// - empty(): Return whether queue is empty",
      testCases: [
        {
          input: ["push", 1, "push", 2, "peek", "pop", "empty"],
          expectedOutput: [null, null, 1, 1, false],
          description: "Basic queue operations"
        }
      ]
    },
    {
      id: 7,
      title: "Course Schedule",
      description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
      difficulty: "Medium",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// Hint: This is a cycle detection problem in a directed graph\n// You can use DFS or topological sorting\n\n// Example:\n// Input: numCourses = 2, prerequisites = [[1,0]]\n// Output: true (take course 0 first, then course 1)",
      testCases: [
        {
          input: { numCourses: 2, prerequisites: [[1, 0]] },
          expectedOutput: true,
          description: "Can complete courses without cycle"
        },
        {
          input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] },
          expectedOutput: false,
          description: "Circular dependency detected"
        }
      ]
    },
    {
      id: 8,
      title: "Find Kth Largest Element",
      description: "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element.",
      difficulty: "Medium",
      techStack: "Generic",
      starterCode: "// Implement your solution here\n// You can use sorting, heap, or quickselect algorithm\n\n// Example:\n// Input: nums = [3,2,1,5,6,4], k = 2\n// Output: 5 (2nd largest element)",
      testCases: [
        {
          input: { nums: [3, 2, 1, 5, 6, 4], k: 2 },
          expectedOutput: 5,
          description: "Find 2nd largest element"
        },
        {
          input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 },
          expectedOutput: 4,
          description: "Find 4th largest with duplicates"
        }
      ]
    }
  ],
  'JavaScript': [
    {
      id: 1,
      title: "Two Sum Problem",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "Easy",
      techStack: "JavaScript",
      starterCode: `function twoSum(nums, target) {
    // Your code here
    
}

// Example usage:
// twoSum([2, 7, 11, 15], 9) should return [0, 1]`,
      testCases: [
        {
          input: { nums: [2, 7, 11, 15], target: 9 },
          expectedOutput: [0, 1],
          description: "Basic case with target found"
        },
        {
          input: { nums: [3, 2, 4], target: 6 },
          expectedOutput: [1, 2],
          description: "Target with different indices"
        }
      ]
    },
    {
      id: 2,
      title: "Reverse a String",
      description: "Write a function that reverses a string without using built-in reverse methods.",
      difficulty: "Easy",
      techStack: "JavaScript",
      starterCode: `function reverseString(str) {
    // Your code here
    
}

// Example usage:
// reverseString("hello") should return "olleh"`,
      testCases: [
        {
          input: "hello",
          expectedOutput: "olleh",
          description: "Basic string reversal"
        },
        {
          input: "JavaScript",
          expectedOutput: "tpircSavaJ",
          description: "Mixed case string"
        }
      ]
    },
    {
      id: 3,
      title: "Find Maximum in Array",
      description: "Find the maximum number in an array without using Math.max().",
      difficulty: "Easy",
      techStack: "JavaScript",
      starterCode: `function findMax(arr) {
    // Your code here
    
}

// Example usage:
// findMax([1, 3, 2, 5, 4]) should return 5`,
      testCases: [
        {
          input: [1, 3, 2, 5, 4],
          expectedOutput: 5,
          description: "Array with positive numbers"
        },
        {
          input: [-1, -3, -2, -5, -4],
          expectedOutput: -1,
          description: "Array with negative numbers"
        }
      ]
    },
    {
      id: 4,
      title: "FizzBuzz",
      description: "Write a program that prints numbers 1 to n, but for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
      difficulty: "Medium",
      techStack: "JavaScript",
      starterCode: `function fizzBuzz(n) {
    // Your code here
    
}

// Example usage:
// fizzBuzz(15) should return an array with FizzBuzz logic`,
      testCases: [
        {
          input: 15,
          expectedOutput: [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"],
          description: "FizzBuzz up to 15"
        }
      ]
    },
    {
      id: 5,
      title: "Valid Parentheses",
      description: "Given a string containing just characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      difficulty: "Medium",
      techStack: "JavaScript",
      starterCode: `function isValid(s) {
    // Your code here
    
}

// Example usage:
// isValid("()[]{}") should return true
// isValid("([)]") should return false`,
      testCases: [
        {
          input: "()",
          expectedOutput: true,
          description: "Simple valid parentheses"
        },
        {
          input: "()[]{}",
          expectedOutput: true,
          description: "Multiple types valid"
        },
        {
          input: "([)]",
          expectedOutput: false,
          description: "Invalid nesting"
        }
      ]
    }
  ],
  'React': [
    {
      id: 6,
      title: "Simple Counter Component",
      description: "Create a React component that displays a counter with increment and decrement buttons.",
      difficulty: "Easy",
      techStack: "React",
      starterCode: `import React, { useState } from 'react';

function Counter() {
    // Your code here
    
    return (
        <div>
            {/* Your JSX here */}
        </div>
    );
}

export default Counter;`,
      testCases: [
        {
          input: "Initial render",
          expectedOutput: "Counter starts at 0",
          description: "Component should initialize with count 0"
        },
        {
          input: "Click increment",
          expectedOutput: "Counter increases by 1",
          description: "Increment button should work"
        }
      ]
    },
    {
      id: 7,
      title: "Todo List Component",
      description: "Create a Todo list component that allows adding and removing todos.",
      difficulty: "Medium",
      techStack: "React",
      starterCode: `import React, { useState } from 'react';

function TodoList() {
    // Your code here
    
    return (
        <div>
            {/* Your JSX here */}
        </div>
    );
}

export default TodoList;`,
      testCases: [
        {
          input: "Add todo",
          expectedOutput: "Todo appears in list",
          description: "Should be able to add new todos"
        },
        {
          input: "Remove todo",
          expectedOutput: "Todo removed from list",
          description: "Should be able to remove todos"
        }
      ]
    }
  ],
  'Python': [
    {
      id: 8,
      title: "Palindrome Checker",
      description: "Write a function to check if a given string is a palindrome (reads the same forwards and backwards).",
      difficulty: "Easy",
      techStack: "Python",
      starterCode: `def is_palindrome(s):
    # Your code here
    pass

# Example usage:
# is_palindrome("racecar") should return True
# is_palindrome("hello") should return False`,
      testCases: [
        {
          input: "racecar",
          expectedOutput: true,
          description: "Simple palindrome"
        },
        {
          input: "hello",
          expectedOutput: false,
          description: "Not a palindrome"
        }
      ]
    },
    {
      id: 9,
      title: "List Comprehension Challenge",
      description: "Create a list of squares of even numbers from 1 to 20 using list comprehension.",
      difficulty: "Easy",
      techStack: "Python",
      starterCode: `def even_squares():
    # Your code here using list comprehension
    pass

# Should return [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]`,
      testCases: [
        {
          input: "1 to 20",
          expectedOutput: [4, 16, 36, 64, 100, 144, 196, 256, 324, 400],
          description: "Squares of even numbers from 1 to 20"
        }
      ]
    }
  ],
  'Node.js': [
    {
      id: 10,
      title: "Simple HTTP Server",
      description: "Create a basic HTTP server that responds with 'Hello World' on the root path.",
      difficulty: "Easy",
      techStack: "Node.js",
      starterCode: `const http = require('http');

// Your code here

// Server should listen on port 3000`,
      testCases: [
        {
          input: "GET /",
          expectedOutput: "Hello World",
          description: "Root path should return Hello World"
        }
      ]
    },
    {
      id: 11,
      title: "File System Operations",
      description: "Write a function that reads a file and counts the number of lines in it.",
      difficulty: "Medium",
      techStack: "Node.js",
      starterCode: `const fs = require('fs');

function countLines(filename) {
    // Your code here
    
}

// Should return the number of lines in the file`,
      testCases: [
        {
          input: "sample.txt",
          expectedOutput: "Number of lines",
          description: "Should count lines correctly"
        }
      ]
    }
  ],
  'Java': [
    {
      id: 12,
      title: "Binary Search Implementation",
      description: "Implement binary search algorithm to find an element in a sorted array.",
      difficulty: "Medium",
      techStack: "Java",
      starterCode: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        // Your code here
        
    }
    
    // Should return index of target, or -1 if not found
}`,
      testCases: [
        {
          input: { arr: [1, 2, 3, 4, 5], target: 3 },
          expectedOutput: 2,
          description: "Find element in middle"
        },
        {
          input: { arr: [1, 2, 3, 4, 5], target: 6 },
          expectedOutput: -1,
          description: "Element not found"
        }
      ]
    }
  ]
}

export async function getRandomQuestions(techStack: string, count: number = 3, level?: string): Promise<Question[]> {
  try {
    // Try to get questions from Gemini API
    const geminiQuestions = await geminiService.generateQuestions(techStack, level || 'Basic', count)
    return geminiQuestions
  } catch (error) {
    console.error('Failed to get questions from Gemini, falling back to static questions:', error)
    
    // Fallback to static questions if Gemini fails
<<<<<<< HEAD
    const questions = allQuestionBank[techStack] || allQuestionBank['JavaScript']
=======
    const questions = questionBank[techStack] || questionBank['JavaScript']
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    
    // Filter questions by level if specified
    let filteredQuestions = questions
    if (level) {
      const difficultyMap: Record<string, string[]> = {
        'Basic': ['Easy'],
        'Intermediate': ['Easy', 'Medium'],
        'Pro': ['Medium', 'Hard']
      }
      
      const allowedDifficulties = difficultyMap[level] || ['Easy', 'Medium', 'Hard']
      filteredQuestions = questions.filter(q => allowedDifficulties.includes(q.difficulty))
    }
    
    // If no questions found for the level, fall back to all questions
    if (filteredQuestions.length === 0) {
      filteredQuestions = questions
    }
    
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}

export function getRandomCodingChallenge(techStack: string) {
  const challenges = codingChallenges[techStack] || codingChallenges['JavaScript']
  const randomIndex = Math.floor(Math.random() * challenges.length)
  return challenges[randomIndex]
}

<<<<<<< HEAD
// Include tech stacks that are supported by the backend execution environment
// JavaScript, Python, Java, and C++ are fully implemented with proper execution environments
export const supportedTechStacks = ['Generic', 'JavaScript', 'Python', 'Java', 'C++']

// Filter questionBank to only include supported tech stacks
const filteredQuestionBank: Record<string, Question[]> = {}
supportedTechStacks.forEach(techStack => {
  if (allQuestionBank[techStack]) {
    filteredQuestionBank[techStack] = allQuestionBank[techStack]
  }
})

export const techStacks = supportedTechStacks
export { filteredQuestionBank as questionBank }
=======
export const techStacks = Object.keys(questionBank)
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
