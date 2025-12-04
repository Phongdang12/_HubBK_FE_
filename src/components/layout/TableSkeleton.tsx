import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
  return (
    <div className="rounded-md border bg-white shadow-sm">

      {/* TABLE CONTENT */}
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            {/* 1. Student ID */}
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            {/* 2. Full Name */}
            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
            {/* 3. Faculty (Hidden on mobile) */}
            <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableHead>
            {/* 4. Room */}
            <TableHead><Skeleton className="h-5 w-16" /></TableHead>
            {/* 5. Building (Hidden on tablet) */}
            <TableHead className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableHead>
            {/* 6. Status */}
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            {/* 7. Actions */}
            <TableHead className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Render 5 hàng skeleton giả lập dữ liệu */}
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {/* Student ID */}
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              
              {/* Full Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                    {/* Avatar tròn giả */}
                    {/* <Skeleton className="h-8 w-8 rounded-full" />  */}
                    <Skeleton className="h-5 w-36" />
                </div>
              </TableCell>
              
              {/* Faculty */}
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
              
              {/* Room (Home icon + text) */}
              <TableCell>
                 <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-12" />
                 </div>
              </TableCell>
              
              {/* Building */}
              <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
              
              {/* Status (Badge style) */}
              <TableCell>
                 <Skeleton className="h-6 w-16 rounded-md" />
              </TableCell>
              
              {/* Actions */}
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" /> {/* Button View */}
                  <Skeleton className="h-8 w-8 rounded-md" /> {/* Button Delete */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* FOOTER PAGINATION */}
      <div className="flex items-center justify-center gap-2 p-4 border-t">
         <Skeleton className="h-8 w-16" /> {/* Prev */}
         <Skeleton className="h-5 w-24" /> {/* Page info */}
         <Skeleton className="h-8 w-16" /> {/* Next */}
      </div>
    </div>
  );
}