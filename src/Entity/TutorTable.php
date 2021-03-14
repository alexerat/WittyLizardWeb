<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorTable
 *
 * @ORM\Table(name="Tutoring.Tutor_Table",
 * indexes={@ORM\Index(name="fk_Tutor_Table_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class TutorTable
{
    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \Doctrine\Common\Collections\Collection|TuteeTable[]
     *
     * @ORM\ManyToMany(targetEntity="TuteeTable", inversedBy="tutors")
     * @ORM\JoinTable(name="tutees", joinColumns={@ORM\JoinColumn(name="tuteeId", referencedColumnName="user")}, inverseJoinColumns={@ORM\JoinColumn(name="tutorId", referencedColumnName="user")})
     */
    protected $tutees;
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->tutees = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return TutorTable
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Add tutee
     *
     * @param \App\Entity\TuteeTable $tutee
     *
     * @return TutorTable
     */
    public function addTutee(\App\Entity\TuteeTable $tutee)
    {
        $this->tutees[] = $tutee;

        return $this;
    }

    /**
     * Remove tutee
     *
     * @param \App\Entity\TuteeTable $tutee
     */
    public function removeTutee(\App\Entity\TuteeTable $tutee)
    {
        $this->tutees->removeElement($tutee);
    }

    /**
     * Get tutees
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTutees()
    {
        return $this->tutees;
    }
}
