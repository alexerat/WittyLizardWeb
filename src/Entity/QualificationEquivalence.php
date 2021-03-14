<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QualificationEquivalence
 *
 * @ORM\Table(name="Users.Qualification_Equivalence")
 * @ORM\Entity
 */
class QualificationEquivalence
{
    /**
     * @var string
     *
     * @ORM\Column(name="Equivalence_Desc", type="string", length=45, nullable=false)
     */
    private $equivalenceDesc;

    /**
     * @var integer
     *
     * @ORM\Column(name="Equivalence_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $equivalenceId;



    /**
     * Set equivalenceDesc
     *
     * @param string $equivalenceDesc
     *
     * @return QualificationEquivalence
     */
    public function setEquivalenceDesc($equivalenceDesc)
    {
        $this->equivalenceDesc = $equivalenceDesc;

        return $this;
    }

    /**
     * Get equivalenceDesc
     *
     * @return string
     */
    public function getEquivalenceDesc()
    {
        return $this->equivalenceDesc;
    }

    /**
     * Get equivalenceId
     *
     * @return integer
     */
    public function getEquivalenceId()
    {
        return $this->equivalenceId;
    }
}
