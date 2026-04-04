import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            GroceriesAI
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Smart grocery lists for your family
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </main>
  );
}
