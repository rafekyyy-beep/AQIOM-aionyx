'use client';

import { cn } from '@/lib/utils/cn';

interface TreeNode {
  name: string;
  value: number;
  children?: TreeNode[];
}

interface GlassTreeMapProps {
  data: TreeNode;
  className?: string;
}

export function GlassTreeMap({ data, className }: GlassTreeMapProps) {
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const colors = ['border-primary-500/30', 'border-blue-500/30', 'border-purple-500/30', 'border-green-500/30', 'border-yellow-500/30'];
    const color = colors[depth % colors.length];

    return (
      <div key={node.name} className="ml-4 mt-2">
        <div className={cn('flex items-center gap-2 p-2 rounded-lg border backdrop-blur-sm bg-white/5', color)}>
          <span className="text-sm font-medium text-white">{node.name}</span>
          <span className="text-xs text-gray-400">{node.value}</span>
        </div>
        {node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={cn('backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl p-4', className)}>
      {renderNode(data)}
    </div>
  );
}
