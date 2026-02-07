const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Category = require('./models/Category');
const Quiz = require('./models/Quiz');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Blog.deleteMany({});
        await Category.deleteMany({});
        await Quiz.deleteMany({});

        console.log('Data Cleared...');

        // Create Users
        const admin = await User.create({
            username: 'AdminUser',
            email: 'admin@psynotes.com',
            password: 'psynotes@26',
            role: 'admin',
        });

        const user1 = await User.create({
            username: 'JaneDoe',
            email: 'jane@example.com',
            password: 'password123',
            role: 'user',
        });

        console.log('Users Created...');

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Cognitive Psychology', slug: 'cognitive-psychology' },
            { name: 'Mental Health', slug: 'mental-health' },
            { name: 'Neuroscience', slug: 'neuroscience' },
            { name: 'Behavioral Science', slug: 'behavioral-science' },
        ]);

        console.log('Categories Created...');

        // Create Blogs
        await Blog.create([
            {
                title: 'The Psychology of Color in Design',
                content: 'Color psychology is the study of hues as a determinant of human behavior. Color influences perceptions that are not obvious, such as the taste of food. Color can indeed influence a person; however, it is important to remember that these effects differ between people. Gender, age, and culture can influence how an individual perceives color. For more details, read on...',
                category: categories[0]._id,
                author: admin._id,
                image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
            },
            {
                title: 'Understanding Anxiety Disorders',
                content: 'Anxiety disorders are a group of mental disorders characterized by significant feelings of anxiety and fear. Anxiety is a worry about future events, and fear is a reaction to current events. These feelings may cause physical symptoms, such as a fast heart rate and shakiness.',
                category: categories[1]._id,
                author: admin._id,
                image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=800&q=80',
            },
            {
                title: 'How Habits are Formed',
                content: 'A habit is a routine of behavior that is repeated regularly and tends to occur subconsciously. The American Journal of Psychology (1903) defined a "habit, from the standpoint of psychology, [as] a more or less fixed way of thinking, willing, or feeling acquired through previous repetition of a mental experience."',
                category: categories[3]._id,
                author: admin._id,
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
            }
        ]);

        console.log('Blogs Created...');

        // Create Quizzes
        await Quiz.create([
            {
                title: 'Intro to Psychology',
                description: 'Test your basic knowledge of psychological concepts.',
                questions: [
                    {
                        questionText: 'Who is considered the father of psychoanalysis?',
                        options: ['B.F. Skinner', 'Sigmund Freud', 'Carl Jung', 'Wilhelm Wundt'],
                        correctAnswer: 'Sigmund Freud',
                    },
                    {
                        questionText: 'What part of the brain is responsibly for memory?',
                        options: ['Cerebellum', 'Hippocampus', 'Amygdala', 'Frontal Lobe'],
                        correctAnswer: 'Hippocampus',
                    }
                ]
            },
            {
                title: 'Personality Types',
                description: 'Which personality type are you familiar with?',
                questions: [
                    {
                        questionText: 'What does "I" stand for in MBTI?',
                        options: ['Intuitive', 'Introverted', 'Intelligent', 'Interesting'],
                        correctAnswer: 'Introverted',
                    }
                ]
            }
        ]);

        console.log('Quizzes Created...');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
