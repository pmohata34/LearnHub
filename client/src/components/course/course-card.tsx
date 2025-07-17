import { Star, Clock, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    price: string;
    level: string;
    category: string;
    duration: string;
    instructor?: {
      id: number;
      username: string;
    };
  };
  onEnroll?: (courseId: number) => void;
  enrolled?: boolean;
}

export function CourseCard({ course, onEnroll, enrolled = false }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&w=400&h=240&fit=crop"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90">
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
            {course.title}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Users className="h-4 w-4 mr-1" />
          <span className="mr-4">{course.instructor?.username || "Unknown Instructor"}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration}</span>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 mr-2">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            4.8 (1,234 reviews)
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl font-bold text-primary">
            ${course.price}
          </span>
          
          {enrolled ? (
            <Link href={`/courses/${course.id}`}>
              <Button className="bg-primary hover:bg-primary/90">
                Continue Learning
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => onEnroll?.(course.id)}
              className="bg-primary hover:bg-primary/90"
            >
              Enroll Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
