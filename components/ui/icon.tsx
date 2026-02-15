// Composant Icon utilisant Phosphor Icons pour toutes les plateformes
import * as Phosphor from 'phosphor-react-native';
import { IconProps as PhosphorIconProps } from 'phosphor-react-native';

export type IconName = keyof typeof IconMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: PhosphorIconProps['weight'];
  style?: any;
}

/**
 * Mapping des noms SF Symbols vers les composants Phosphor
 * Cela permet une migration transparente sans changer tous les appels d'icônes
 */
const IconMap = {
  // Navigation
  'house.fill': Phosphor.House,
  'chevron.left': Phosphor.CaretLeft,
  'chevron.right': Phosphor.CaretRight,
  'arrow.clockwise': Phosphor.ArrowClockwise,
  'arrow.triangle.2.circlepath': Phosphor.ArrowsClockwise,
  
  // Actions
  'play.fill': Phosphor.Play,
  'plus.circle': Phosphor.PlusCircle,
  'minus.circle': Phosphor.MinusCircle,
  'pencil': Phosphor.Pencil,
  'trash.fill': Phosphor.Trash,
  'xmark.circle.fill': Phosphor.XCircle,
  
  // Status et Info
  'checkmark.circle.fill': Phosphor.CheckCircle,
  'checkmark.circle': Phosphor.CheckCircle,
  'checkmark': Phosphor.Check,
  'info.circle.fill': Phosphor.Info,
  'star.fill': Phosphor.Star,
  'exclamationmark.triangle': Phosphor.Warning,
  
  // Communication
  'envelope.fill': Phosphor.Envelope,
  'phone.fill': Phosphor.Phone,
  
  // User
  'person.fill': Phosphor.User,
  'person.2': Phosphor.Users,
  'lock.fill': Phosphor.Lock,
  'rectangle.portrait.and.arrow.right': Phosphor.SignOut,
  
  // Ticketing
  'ticket': Phosphor.Ticket,
  'ticket.fill': Phosphor.Ticket,
  'popcorn.fill': Phosphor.Popcorn,
  
  // Temps et Lieu
  'calendar': Phosphor.Calendar,
  'calendar.badge.exclamationmark': Phosphor.CalendarX,
  'clock': Phosphor.Clock,
  'location': Phosphor.MapPin,
  
  // Favoris et Payment
  'heart': Phosphor.Heart,
  'heart.fill': Phosphor.Heart,
  'creditcard.fill': Phosphor.CreditCard,
  'banknote': Phosphor.Money,
  
  // Autres
  'archivebox': Phosphor.Archive,
  'paperplane.fill': Phosphor.PaperPlane,
  'chevron.left.forwardslash.chevron.right': Phosphor.Code,
};

/**
 * Composant Icon unifié utilisant Phosphor Icons
 * Compatible avec l'ancienne API IconSymbol pour faciliter la migration
 */
export function Icon({ 
  name, 
  size = 24, 
  color = '#000000',
  weight = 'regular',
  style 
}: IconProps) {
  const IconComponent = IconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon: No mapping found for "${name}". Using default icon.`);
    return <Phosphor.Question size={size} color={color} weight={weight} style={style} />;
  }
  
  // Conversion du weight pour les icônes "fill"
  const iconWeight = name.includes('.fill') ? 'fill' : weight;
  
  return <IconComponent size={size} color={color} weight={iconWeight} style={style} />;
}

// Alias pour compatibilité avec l'ancien code
export const IconSymbol = Icon;
