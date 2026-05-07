"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, User, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { useGlobalSearch, SearchResult } from "@/hooks/use-search";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data, isLoading } = useGlobalSearch(query);

  const results = data?.results || [];

  const students = results.filter(r => r.type === "student");
  const classrooms = results.filter(r => r.type === "classroom");
  const courses = results.filter(r => r.type === "course");

  const renderResultItem = (result: SearchResult) => {
    const Icon = result.type === "student" ? GraduationCap : 
                 result.type === "classroom" ? User : BookOpen;
    
    return (
      <Link key={`${result.type}-${result.id}`} href={result.url}>
        <div className="flex items-center p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
          <div className={`p-2 rounded-lg mr-4 ${
            result.type === 'student' ? 'bg-blue-100 text-blue-600' :
            result.type === 'classroom' ? 'bg-purple-100 text-purple-600' :
            'bg-orange-100 text-orange-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{result.title}</h3>
            <p className="text-sm text-muted-foreground">{result.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{result.type}</Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search Results</h1>
          <p className="text-muted-foreground mt-1">
            {query ? `Showing results for "${query}"` : "Enter a search term to find students, classes, or courses."}
          </p>
        </div>
        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
      </div>

      {!query ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Global Search</h2>
            <p className="text-muted-foreground max-w-md">
              Type in the search bar above to find anything in the system.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-20 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-muted-foreground max-w-md">
              We couldn't find anything matching "{query}". Try a different term.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {students.map(renderResultItem)}
              </CardContent>
            </Card>
          )}

          {classrooms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Classes ({classrooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {classrooms.map(renderResultItem)}
              </CardContent>
            </Card>
          )}

          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
                  Courses ({courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {courses.map(renderResultItem)}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
